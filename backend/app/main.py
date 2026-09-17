import os
from pathlib import Path

# Load backend/.env for local dev (uvicorn plain CLI). No-op on Railway /
# production where real env vars are injected (they take precedence).
try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - requirements.txt includes it
    load_dotenv = None
if load_dotenv is not None:
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.routes.photos import router as photos_router
from app.routes.share import router as share_router
from app.services.transcode import is_ffmpeg_available

app = FastAPI(title="AWS Photobooth API", version="1.0.0")

frontend_urls = [u.strip().rstrip("/") for u in os.environ.get("FRONTEND_URL", "").split(",") if u.strip()]
if frontend_urls:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=frontend_urls,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

app.include_router(photos_router)
app.include_router(share_router)

# Strict: Supabase must be configured or all photo/video routes 503 (no local fallback).
# Warn early so misconfigured deploys surface in logs, not just on first upload.
_missing = [k for k in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY") if not os.environ.get(k, "").strip()]
if _missing:
    import logging as _logging
    _logging.getLogger("uvicorn.error").warning(
        f"Supabase not configured ({', '.join(_missing)} missing) - /api/photos/* will 503. "
        "Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (+ SUPABASE_BUCKET=photobooth)."
    )


# Observable in Railway logs + /api/health so we can verify ffmpeg landed
# after deploy instead of guessing from download behavior.
logger.info(f"ffmpeg available: {is_ffmpeg_available()}")


@app.get("/api/health")
async def health():
    return {"status": "ok", "ffmpeg": is_ffmpeg_available()}
