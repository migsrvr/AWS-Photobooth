import json
import os
import socket
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from loguru import logger

from app.services import db as db_service
from app.services.compress import compress_image
from app.services.storage import save_session_media, supabase_delete, supabase_download

router = APIRouter(prefix="/api/photos", tags=["photos"])

# All durable state is Supabase: Storage bucket `photobooth` + table `survey_responses`.
# No local disk fallback; no JSON sidecar. Configure SUPABASE_* or requests 503.

EXT_BY_MIME = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
VIDEO_MIMES = {"video/webm": "webm", "video/mp4": "mp4"}
PHOTO_MEDIA = {"jpg": "image/jpeg"}
VIDEO_MEDIA = {"webm": "video/webm", "mp4": "video/mp4"}

MAX_PHOTO_MB = float(os.environ.get("MAX_PHOTO_MB", "15"))
MAX_VIDEO_MB = float(os.environ.get("MAX_VIDEO_MB", "8"))


def public_base_url() -> str:
    """Absolute base URL phones can reach. Override with PUBLIC_BASE_URL."""
    env = (os.environ.get("PUBLIC_BASE_URL") or "").strip().rstrip("/")
    if env:
        if "://" not in env:
            env = "https://" + env
        return env
    try:
        lan_ip = socket.gethostbyname(socket.gethostname())
    except OSError:
        lan_ip = "127.0.0.1"
    return f"http://{lan_ip}:8000"


@router.get("")
async def list_photos():
    """Lists every session from Supabase table `survey_responses`."""
    try:
        rows = db_service.list_surveys()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    items = []
    for row in rows:
        sid = row.get("session_id")
        if not sid:
            continue
        items.append({
            "session_id": sid,
            "created_at": row.get("created_at"),
            # has_video derived from video_path (no bool column)
            "has_video": row.get("video_path") is not None,
            "download_url": f"{public_base_url()}/api/photos/{sid}/download",
            "share_url": f"{public_base_url()}/s/{sid}",
        })
    return {"count": len(items), "photos": items}


@router.post("/upload")
async def upload_photo(photo: UploadFile = File(...), answers: str = Form("{}"),
                       video: UploadFile | None = File(default=None)):
    if photo.content_type not in EXT_BY_MIME:
        raise HTTPException(status_code=400, detail="photo must be an image")
    try:
        parsed_answers = json.loads(answers)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="answers must be JSON")
    if not isinstance(parsed_answers, dict):
        raise HTTPException(status_code=400, detail="answers must be JSON")
    video_ext = None
    if video is not None:
        video_mime = (video.content_type or "").split(";")[0].strip()
        if video_mime not in VIDEO_MIMES:
            raise HTTPException(status_code=400, detail="video must be webm or mp4")
        video_ext = VIDEO_MIMES[video_mime]

    raw_photo = await photo.read()
    if len(raw_photo) > MAX_PHOTO_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="photo too large")
    raw_video = await video.read() if video is not None else None
    if raw_video is not None and len(raw_video) > MAX_VIDEO_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="video too large (max ~8MB)")

    photo_bytes, _ext = compress_image(raw_photo)

    session_id = uuid.uuid4().hex[:12]
    created_at = datetime.now(timezone.utc).isoformat()

    # 1) Storage (photo required, video optional). No local fallback.
    try:
        media = save_session_media(session_id, photo_bytes, raw_video, video_ext)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    if media is None:
        raise HTTPException(status_code=503, detail="storage upload failed")
    photo_path, video_path = media

    # 2) Postgres row (straight to table, no JSON sidecar)
    try:
        ok = db_service.insert_survey(session_id, created_at, parsed_answers, photo_path, video_path)
    except RuntimeError as e:
        # Supabase not configured -> clean up uploaded objects (best-effort) then expose config error
        try:
            supabase_delete(photo_path)
            if video_path:
                supabase_delete(video_path)
        except Exception:
            pass
        raise HTTPException(status_code=503, detail=str(e))
    if not ok:
        # DB insert failed -> clean up storage so we don't leak orphans
        try:
            supabase_delete(photo_path)
            if video_path:
                supabase_delete(video_path)
        except Exception:
            pass
        raise HTTPException(status_code=503, detail="database insert failed")

    logger.info(f"session {session_id}: stored supabase photo={photo_path} video={video_path}")
    return {
        "session_id": session_id,
        "download_url": f"{public_base_url()}/api/photos/{session_id}/download",
        "share_url": f"{public_base_url()}/s/{session_id}",
    }


@router.get("/{session_id}/download")
async def download_photo(session_id: str):
    try:
        row = db_service.get_survey(session_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    if row is None:
        raise HTTPException(status_code=404, detail="photo not found")
    photo_path = row.get("photo_path")
    if not photo_path:
        raise HTTPException(status_code=404, detail="photo not found")
    try:
        data = supabase_download(photo_path)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    if data is None:
        raise HTTPException(status_code=404, detail="photo not found")
    return Response(
        content=data,
        media_type=PHOTO_MEDIA.get(photo_path.rsplit(".", 1)[-1], "image/jpeg"),
        headers={"Content-Disposition": f'inline; filename="photobooth-{session_id}.jpg"'},
    )


@router.get("/{session_id}/video")
async def download_video(session_id: str):
    try:
        row = db_service.get_survey(session_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    if row is None:
        raise HTTPException(status_code=404, detail="photo not found")
    video_path = row.get("video_path")
    if not video_path:
        raise HTTPException(status_code=404, detail="video not found")
    try:
        data = supabase_download(video_path)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    if data is None:
        raise HTTPException(status_code=404, detail="video not found")
    ext = video_path.rsplit(".", 1)[-1]
    return Response(
        content=data,
        media_type=VIDEO_MEDIA.get(ext, "video/webm"),
        headers={"Content-Disposition": f'inline; filename="photobooth-{session_id}.{ext}"'},
    )
