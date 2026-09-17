"""WebM → MP4 transcoding with ffmpeg (legacy fallback).

The booth records MP4 directly, so this only runs for webm files stored
before the MP4 switch: on first download they are transcoded to MP4
(H.264 + AAC, yuv420p, faststart) so iPhone Gallery / Files can play
them. FFmpeg is installed via nixpacks.toml (aptPkgs = ["ffmpeg"]).

Graceful fallback: if ffmpeg is missing or transcode fails, the caller
serves the stored bytes unchanged (route does this).
"""
import os
import shutil
import subprocess
import tempfile

from loguru import logger


def is_ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def transcode_webm_to_mp4(webm_bytes: bytes, timeout: int = 20) -> bytes | None:
    """
    Transcode raw webm bytes → mp4 bytes.

    Returns mp4 bytes on success, None on any failure (caller falls back).
    Uses temp files so ffmpeg gets a real seekable input; keeps memory
    predictable for ~8MB clips. Fast preset + CRF 23 keeps quality high
    and stays under Railway's default timeout.
    """
    if not webm_bytes:
        return None
    if not is_ffmpeg_available():
        logger.warning("transcode_webm_to_mp4: ffmpeg not found on PATH, serving webm as-is")
        return None

    in_path = None
    out_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as fin:
            fin.write(webm_bytes)
            in_path = fin.name
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as fout:
            out_path = fout.name

        # Single pass: H.264 video, AAC audio when present. yuv420p +
        # faststart are required for quicktime / iOS playback. Veryfast
        # keeps CPU low on Railway. `-map 0:a?` makes audio mapping
        # optional: opus audio becomes AAC, video-only input (the booth
        # records with audio:false) succeeds without a second run.
        cmd = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel", "error",
            "-i", in_path,
            "-map", "0:v",
            "-map", "0:a?",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            out_path,
        ]
        result = subprocess.run(cmd, capture_output=True, timeout=timeout)
        if result.returncode != 0:
            err = result.stderr.decode(errors="replace")[:500]
            logger.warning(f"ffmpeg transcode failed ({result.returncode}): {err}")
            return None

        if not os.path.exists(out_path):
            logger.warning("transcode_webm_to_mp4: output file missing after ffmpeg")
            return None
        with open(out_path, "rb") as f:
            mp4 = f.read()
        if not mp4:
            logger.warning("transcode_webm_to_mp4: ffmpeg produced 0 bytes")
            return None
        logger.info(f"transcode_webm_to_mp4: {len(webm_bytes)} -> {len(mp4)} bytes")
        return mp4
    except subprocess.TimeoutExpired:
        logger.warning("transcode_webm_to_mp4: ffmpeg timed out")
        return None
    except Exception as e:
        logger.warning(f"transcode_webm_to_mp4 failed ({e})")
        return None
    finally:
        for p in (in_path, out_path):
            if p and os.path.exists(p):
                try:
                    os.unlink(p)
                except OSError:
                    pass
