import json
import os
import socket
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/photos", tags=["photos"])

# Repo-root uploads/ (AWS-Photobooth/uploads), independent of uvicorn's cwd.
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))))
UPLOAD_DIR = os.path.join(REPO_ROOT, "uploads")
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


def _save_sidecar(session_id: str, answers: dict) -> None:
    meta = {
        "session_id": session_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "answers": answers,
    }
    with open(os.path.join(UPLOAD_DIR, f"{session_id}.json"), "w") as f:
        json.dump(meta, f)


@router.get("")
async def list_photos():
    """Lists every session on this server (powers tools/pull-photos.py)."""
    items = []
    for name in sorted(os.listdir(UPLOAD_DIR)):
        if not name.endswith(".json"):
            continue
        try:
            with open(os.path.join(UPLOAD_DIR, name)) as f:
                meta = json.load(f)
        except (OSError, json.JSONDecodeError):
            continue
        session_id = meta.get("session_id")
        if not session_id:
            continue
        items.append({
            "session_id": session_id,
            "created_at": meta.get("created_at"),
            "download_url": f"{public_base_url()}/api/photos/{session_id}/download",
        })
    return {"count": len(items), "photos": items}


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

    with open(os.path.join(UPLOAD_DIR, f"{session_id}.{ext}"), "wb") as f:
        f.write(content)

    _save_sidecar(session_id, parsed_answers)

    return {
        "session_id": session_id,
        "download_url": f"{public_base_url()}/api/photos/{session_id}/download",
    }


@router.get("/{session_id}/download")
async def download_photo(session_id: str):
    try:
        with open(os.path.join(UPLOAD_DIR, f"{session_id}.json")) as f:
            json.load(f)
    except (OSError, json.JSONDecodeError):
        raise HTTPException(status_code=404, detail="photo not found")

    for ext, media in (("jpg", "image/jpeg"), ("png", "image/png"), ("webp", "image/webp")):
        path = os.path.join(UPLOAD_DIR, f"{session_id}.{ext}")
        if os.path.isfile(path):
            return FileResponse(path, media_type=media, filename=f"photobooth-{session_id}.{ext}")
    raise HTTPException(status_code=404, detail="photo not found")
