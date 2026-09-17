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
from app.services.storage import save_session_media, supabase_delete, supabase_download, supabase_upload
from app.services.transcode import is_ffmpeg_available, transcode_webm_to_mp4

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
            "template": row.get("template", "orgfest"),
            "bw": bool(row.get("bw", False)),
            "download_url": f"{public_base_url()}/api/photos/{sid}/download",
            "share_url": f"{public_base_url()}/s/{sid}",
        })
    return {"count": len(items), "photos": items}


@router.post("/upload")
async def upload_photo(photo: UploadFile = File(...), answers: str = Form("{}"),
                       video: UploadFile | None = File(default=None),
                       template: str = Form("orgfest"), bw: str = Form("false")):
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

    # Normalize template/bw from form (frontend may send string).
    template = (template or "orgfest").strip().lower()
    if template not in ("orgfest", "alt"):
        template = "orgfest"
    bw = str(bw).strip().lower() in ("1", "true", "yes", "on")

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
        ok = db_service.insert_survey(session_id, created_at, parsed_answers, photo_path, video_path, template, bw)
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

    logger.info(f"session {session_id}: stored supabase photo={photo_path} video={video_path} template={template} bw={bw}")
    return {
        "session_id": session_id,
        "download_url": f"{public_base_url()}/api/photos/{session_id}/download",
        "share_url": f"{public_base_url()}/s/{session_id}",
        "template": template,
        "bw": bw,
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
    """
    Serves the clip. Booth records MP4 so storage and download are MP4
    with no conversion. Legacy webm files (recorded before the MP4
    switch) are transcoded to H.264/AAC on first hit and the mp4 is
    cached back to Storage as {session_id}.mp4. If ffmpeg is absent or
    transcode fails, serves the stored bytes unchanged (fallback).
    """
    try:
        row = db_service.get_survey(session_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    if row is None:
        raise HTTPException(status_code=404, detail="photo not found")
    video_path = row.get("video_path")
    if not video_path:
        raise HTTPException(status_code=404, detail="video not found")

    # Stored mp4 can be served directly (e.g. Safari capture, or already
    # cached mp4 copy of a webm). No transcoding needed.
    ext = video_path.rsplit(".", 1)[-1].lower()
    if ext == "mp4":
        try:
            data = supabase_download(video_path)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))
        if data is None:
            raise HTTPException(status_code=404, detail="video not found")
        return Response(
            content=data,
            media_type="video/mp4",
            headers={"Content-Disposition": f'inline; filename="photobooth-{session_id}.mp4"'},
        )

    # Stored webm: try mp4 cache first, then transcode and cache.
    # The cache key is deterministic so we don't need a DB column.
    mp4_cache_path = video_path.rsplit(".", 1)[0] + ".mp4"
    # 1) cache hit -> serve mp4 directly
    try:
        cached = supabase_download(mp4_cache_path)
    except RuntimeError:
        cached = None
    if cached is not None:
        logger.info(f"video {session_id}: serving cached mp4 ({len(cached)} bytes)")
        return Response(
            content=cached,
            media_type="video/mp4",
            headers={"Content-Disposition": f'inline; filename="photobooth-{session_id}.mp4"'},
        )

    # 2) cache miss -> download webm source
    try:
        webm_data = supabase_download(video_path)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    if webm_data is None:
        raise HTTPException(status_code=404, detail="video not found")

    # No ffmpeg (local dev without nixpacks) -> serve webm unchanged.
    if not is_ffmpeg_available():
        logger.warning(f"video {session_id}: ffmpeg unavailable, serving webm as-is")
        return Response(
            content=webm_data,
            media_type="video/webm",
            headers={"Content-Disposition": f'inline; filename="photobooth-{session_id}.webm"'},
        )

    mp4 = transcode_webm_to_mp4(webm_data)
    if mp4 is None:
        # transcode error -> fall back to original webm
        return Response(
            content=webm_data,
            media_type="video/webm",
            headers={"Content-Disposition": f'inline; filename="photobooth-{session_id}.webm"'},
        )

    # 3) fire-and-forget cache write so next request is fast. Failures
    # are non-fatal (we still serve the freshly transcoded bytes).
    try:
        ok = supabase_upload(mp4_cache_path, mp4, "video/mp4")
        if ok:
            logger.info(f"video {session_id}: cached mp4 {mp4_cache_path} ({len(mp4)} bytes)")
        else:
            logger.warning(f"video {session_id}: mp4 cache upload failed for {mp4_cache_path}")
    except Exception as e:
        logger.warning(f"video {session_id}: mp4 cache exception ({e})")

    return Response(
        content=mp4,
        media_type="video/mp4",
        headers={"Content-Disposition": f'inline; filename="photobooth-{session_id}.mp4"'},
    )
