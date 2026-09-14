import json
import os
import socket
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response

from app.services import drive

router = APIRouter(prefix="/api/photos", tags=["photos"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

EXT_BY_MIME = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def public_base_url() -> str:
    """Absolute base URL phones can reach. Override with PUBLIC_BASE_URL."""
    env = os.environ.get("PUBLIC_BASE_URL")
    if env:
        return env.rstrip("/")
    try:
        lan_ip = socket.gethostbyname(socket.gethostname())
    except OSError:
        lan_ip = "127.0.0.1"
    return f"http://{lan_ip}:8000"


def _save_sidecar(session_id: str, answers: dict, drive_file_id: str | None) -> None:
    meta = {
        "session_id": session_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "answers": answers,
        "drive_file_id": drive_file_id,
    }
    with open(os.path.join(UPLOAD_DIR, f"{session_id}.json"), "w") as f:
        json.dump(meta, f)


@router.post("/upload")
async def upload_photo(photo: UploadFile = File(...), answers: str = Form("{}")):
    if photo.content_type not in EXT_BY_MIME:
        raise HTTPException(status_code=400, detail="photo must be an image")
    try:
        parsed_answers = json.loads(answers)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="answers must be JSON")

    session_id = uuid.uuid4().hex[:12]
    ext = EXT_BY_MIME[photo.content_type]
    content = await photo.read()

    drive_file_id = None
    if drive.is_configured():
        tmp_path = os.path.join(UPLOAD_DIR, f"{session_id}.{ext}")
        with open(tmp_path, "wb") as f:
            f.write(content)
        try:
            drive_file_id = drive.upload_file(tmp_path, f"photobooth-{session_id}.{ext}",
                                              photo.content_type)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    else:
        with open(os.path.join(UPLOAD_DIR, f"{session_id}.{ext}"), "wb") as f:
            f.write(content)

    _save_sidecar(session_id, parsed_answers, drive_file_id)

    return {
        "session_id": session_id,
        "download_url": f"{public_base_url()}/api/photos/{session_id}/download",
    }


@router.get("/{session_id}/download")
async def download_photo(session_id: str):
    try:
        with open(os.path.join(UPLOAD_DIR, f"{session_id}.json")) as f:
            meta = json.load(f)
    except (OSError, json.JSONDecodeError):
        raise HTTPException(status_code=404, detail="photo not found")

    drive_file_id = meta.get("drive_file_id")
    if drive_file_id and drive.is_configured():
        content, mime_type = drive.download_bytes(drive_file_id)
        return Response(content, media_type=mime_type)

    for ext, media in (("jpg", "image/jpeg"), ("png", "image/png"), ("webp", "image/webp")):
        path = os.path.join(UPLOAD_DIR, f"{session_id}.{ext}")
        if os.path.isfile(path):
            return FileResponse(path, media_type=media, filename=f"photobooth-{session_id}.{ext}")
    raise HTTPException(status_code=404, detail="photo not found")
