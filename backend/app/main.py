import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.photos import router as photos_router
from app.routes.share import router as share_router

app = FastAPI(title="AWS Photobooth API", version="1.0.0")

frontend_urls = [u.strip() for u in os.environ.get("FRONTEND_URL", "").split(",") if u.strip()]
if frontend_urls:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=frontend_urls,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

app.include_router(photos_router)
app.include_router(share_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
