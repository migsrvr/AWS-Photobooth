"""Supabase Storage backend - strict, no local fallback.

All media live in bucket `photobooth` (public). No JSON sidecar;
survey answers live in Postgres table `survey_responses` (see db.py).

SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_BUCKET are required;
missing creds raise at call time (no silent degrade). `httpx` is required.
"""
import os

from loguru import logger

import httpx


def _cfg() -> tuple[str, str, str]:
    url = (os.environ.get("SUPABASE_URL") or "").strip().rstrip("/")
    key = (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    bucket = (os.environ.get("SUPABASE_BUCKET") or "photobooth").strip()
    if not url or not key or not bucket:
        raise RuntimeError(
            "Supabase not configured: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET"
        )
    if "://" not in url:
        url = "https://" + url
    return url, key, bucket


def _auth_headers(key: str, content_type: str | None = None) -> dict:
    h = {"apikey": key, "Authorization": f"Bearer {key}"}
    if content_type:
        h["Content-Type"] = content_type
    return h


def supabase_upload(object_path: str, data: bytes, content_type: str) -> bool:
    url, key, bucket = _cfg()
    endpoint = f"{url}/storage/v1/object/{bucket}/{object_path}"
    try:
        with httpx.Client(timeout=15.0) as client:
            r = client.post(
                endpoint,
                content=data,
                headers={**_auth_headers(key, content_type), "x-upsert": "true"},
            )
        if r.status_code in (200, 201):
            return True
        logger.warning(f"supabase upload {object_path} -> {r.status_code}: {r.text[:200]}")
        return False
    except Exception as e:
        logger.warning(f"supabase upload {object_path} failed ({e})")
        return False


def supabase_download(object_path: str) -> bytes | None:
    url, key, bucket = _cfg()
    endpoint = f"{url}/storage/v1/object/{bucket}/{object_path}"
    try:
        with httpx.Client(timeout=15.0) as client:
            r = client.get(endpoint, headers=_auth_headers(key))
        if r.status_code == 200:
            return r.content
        if r.status_code != 404:
            logger.warning(f"supabase download {object_path} -> {r.status_code}")
        return None
    except Exception as e:
        logger.warning(f"supabase download {object_path} failed ({e})")
        return None


def supabase_exists(object_path: str) -> bool:
    url, _key, bucket = _cfg()
    public_url = f"{url}/storage/v1/object/public/{bucket}/{object_path}"
    try:
        with httpx.Client(timeout=5.0) as client:
            r = client.head(public_url)
            if r.status_code == 200:
                return True
            if r.status_code in (400, 403, 405):
                r2 = client.get(public_url, headers={"Range": "bytes=0-0"})
                return r2.status_code in (200, 206)
            return False
    except Exception:
        return False


def supabase_delete(object_path: str) -> bool:
    """Best-effort delete (used to clean up after failed DB insert)."""
    url, key, bucket = _cfg()
    endpoint = f"{url}/storage/v1/object/{bucket}/{object_path}"
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.delete(endpoint, headers=_auth_headers(key))
        return r.status_code in (200, 204)
    except Exception as e:
        logger.warning(f"supabase delete {object_path} failed ({e})")
        return False


def save_session_media(
    session_id: str,
    photo_bytes: bytes,
    video_bytes: bytes | None,
    video_ext: str | None,
) -> tuple[str, str | None] | None:
    """Upload photo + optional video. Returns (photo_path, video_path) or None on photo failure."""
    photo_path = f"{session_id}.jpg"
    if not supabase_upload(photo_path, photo_bytes, "image/jpeg"):
        return None
    video_path: str | None = None
    if video_bytes is not None and video_ext:
        video_path = f"{session_id}.{video_ext}"
        media = {"webm": "video/webm", "mp4": "video/mp4"}.get(video_ext, "video/webm")
        if not supabase_upload(video_path, video_bytes, media):
            logger.warning(f"session {session_id}: video upload failed, photo kept")
            video_path = None
    return photo_path, video_path
