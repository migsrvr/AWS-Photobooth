"""Public share page: QR codes open photo / video download pages.

Route: GET /s/{session_id}?media=photo|video|all - self-contained HTML
(inline CSS, no external assets) in the booth's newspaper theme, so any
phone browser renders it. `media` filters to one item so the booth can
show a dedicated photo QR and video QR; default `all` keeps the old
combined page.
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse

router = APIRouter(tags=["share"])


def _session_urls(session_id: str, base: str) -> tuple[str, str | None]:
    from app.services import db as db_service
    from app.services.storage import supabase_exists

    try:
        row = db_service.get_survey(session_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    if row is None:
        raise HTTPException(status_code=404, detail="photo not found")
    photo_path = row.get("photo_path")
    if not photo_path:
        raise HTTPException(status_code=404, detail="photo not found")
    # existence check keeps share page honest if storage object was deleted
    try:
        if not supabase_exists(photo_path):
            raise HTTPException(status_code=404, detail="photo not found")
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    photo_url = f"{base}/api/photos/{session_id}/download"
    video_url = None
    video_path = row.get("video_path")
    if video_path:
        try:
            if supabase_exists(video_path):
                video_url = f"{base}/api/photos/{session_id}/video"
        except RuntimeError:
            # storage not configured -> no video link but page still renders
            video_url = None
    return photo_url, video_url


@router.get("/s/{session_id}", response_class=HTMLResponse)
async def share_page(session_id: str, media: str = Query("all")):
    from app.routes.photos import public_base_url

    media = (media or "all").strip().lower()
    if media not in ("all", "photo", "video"):
        raise HTTPException(status_code=400, detail="media must be photo, video, or all")
    base = public_base_url()
    photo_url, video_url = _session_urls(session_id, base)
    if media == "video" and not video_url:
        raise HTTPException(status_code=404, detail="video not found")

    show_photo = media in ("all", "photo")
    show_video = media in ("all", "video") and video_url
    title = {"all": "YOUR FRONT PAGE", "photo": "YOUR PHOTO",
             "video": "YOUR VIDEO"}[media]

    photo_block = (
        f"""<img src="{photo_url}" alt="Your photobooth photo" />
  <a class="btn" href="{photo_url}" download="photobooth-{session_id}.jpg">Save photo</a>"""
        if show_photo else ""
    )
    # The API now serves mp4 (transcoded from stored webm), which plays on
    # iPhone. Filename + type hint match mp4 so Save works even when the
    # underlying object in Storage is still .webm.
    video_block = (
        f"""
    <video controls playsinline preload="metadata" src="{video_url}" type="video/mp4"></video>
    <a class="btn" href="{video_url}" download="photobooth-{session_id}.mp4">Save video</a>"""
        if show_video else ""
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AWS Photobooth — your front page</title>
<style>
  body {{ margin: 0; font-family: Georgia, 'Times New Roman', serif;
         background: #f0dfce; color: #1e1e1e; }}
  main {{ max-width: 640px; margin: 0 auto; padding: 32px 20px 48px; text-align: center; }}
  h1 {{ font-size: 34px; letter-spacing: 1px; margin: 0 0 4px; }}
  p.sub {{ font-style: italic; opacity: .8; margin: 0 0 24px; }}
  img, video {{ width: 100%; border-radius: 8px; border: 3px solid #4a3017;
                background: #d9d9d9; margin-top: 20px; }}
  .btn {{ display: block; margin: 12px auto 0; max-width: 320px; padding: 14px;
         border: 2px solid #4a3017; border-radius: 8px; text-decoration: none;
         color: #4a3017; font-weight: bold; background: rgba(237,244,255,.5); }}
  .code {{ margin-top: 28px; opacity: .6; font-size: 14px; }}
</style>
</head>
<body>
<main>
  <h1>{title}</h1>
  <p class="sub">Fresh off the AWS Photobooth press.</p>
  {photo_block}{video_block}
  <p class="code">CODE: {session_id[:6].upper()}</p>
</main>
</body>
</html>"""
