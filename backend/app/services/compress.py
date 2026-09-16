"""Image compression for Supabase Storage uploads.

Keeps each session small enough to fit Supabase free-tier limits:
photo -> max 1600px long edge, JPEG q~78 progressive. Video is stored
as captured (usually webm on Chromium, mp4 on Safari) and transcoded
to mp4 on download via app.services.transcode (ffmpeg via nixpacks.toml)
so phones always get an iPhone-playable file while storage stays small.
"""
import io
import os

from loguru import logger
from PIL import Image

PHOTO_MAX_DIM = int(os.environ.get("PHOTO_MAX_DIM", "1600"))
PHOTO_JPEG_QUALITY = int(os.environ.get("PHOTO_JPEG_QUALITY", "78"))


def compress_image(data: bytes) -> tuple[bytes, str]:
    """Compress raw image bytes to a small JPEG.

    Returns (bytes, ext). Always returns JPEG ("jpg") on success so
    storage paths are uniform. On any failure returns the original
    bytes with a best-guess ext so upload can still proceed (fail-open).
    """
    try:
        with Image.open(io.BytesIO(data)) as img:
            if img.mode in ("RGBA", "LA", "PA"):
                bg = Image.new("RGB", img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[-1])
                img = bg
            elif img.mode != "RGB":
                img = img.convert("RGB")
            img.thumbnail((PHOTO_MAX_DIM, PHOTO_MAX_DIM), Image.LANCZOS)
            out = io.BytesIO()
            img.save(
                out,
                format="JPEG",
                quality=PHOTO_JPEG_QUALITY,
                optimize=True,
                progressive=True,
            )
            compressed = out.getvalue()
            logger.info(
                f"compress_image: {len(data)} -> {len(compressed)} bytes "
                f"({img.size[0]}x{img.size[1]} q={PHOTO_JPEG_QUALITY})"
            )
            return compressed, "jpg"
    except Exception as e:
        logger.warning(f"compress_image failed, storing original ({e})")
        return data, "jpg"
