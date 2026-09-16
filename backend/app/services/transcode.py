"""WebM → MP4 transcoding with ffmpeg.

Storage stays WebM (small, matches what MediaRecorder produces on Chromium).
Download serves MP4 (H.264 + AAC, yuv420p, faststart) so iPhone Gallery / Files
can play it without extra apps. FFmpeg is installed via nixpacks.toml
(aptPkgs = ["ffmpeg"]).

Graceful fallback: if ffmpeg is missing or transcode fails, the caller
should serve the original WebM bytes unchanged (route does this).
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

        # H.264 video, AAC audio when present. yuv420p + faststart are required
        # for quicktime / iOS playback. Veryfast keeps CPU low on Railway.
        # We probe for audio implicitly: -c:a aac will no-op with warning if
        # no audio stream; add -map 0 so we don't drop audio, but don't
        # hard-fail when input is video-only.
        cmd = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel", "error",
            "-i", in_path,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            # Only transcode audio if it exists; copy silence otherwise.
            # Using -c:a aac with aac fallback: if webm has opus, this
            # becomes aac. If no audio, ffmpeg warns but still writes video.
            "-c:a", "aac",
            "-b:a", "128k",
            out_path,
        ]
        result = subprocess.run(cmd, capture_output=True, timeout=timeout)
        if result.returncode != 0:
            err = result.stderr.decode(errors="replace")[:500]
            logger.warning(f"ffmpeg transcode failed ({result.returncode}): {err}")
            # Fallback: try video-only (no audio codec) for opus-less clips
            cmd_video_only = [
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-i", in_path,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                "-an",
                out_path,
            ]
            result2 = subprocess.run(cmd_video_only, capture_output=True, timeout=timeout)
            if result2.returncode != 0:
                err2 = result2.stderr.decode(errors="replace")[:500]
                logger.warning(f"ffmpeg video-only fallback failed ({result2.returncode}): {err2}")
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
