"""Pull every event photo (+ clip) off the booth server into a local folder.

One process, safe to re-run: sessions already on disk are skipped.

Usage (PowerShell, repo root):
  py tools/pull-photos.py --server https://<railway-app> [--out ./event-photos]

--server can also come from the PHOTOBOOTH_SERVER environment variable.
Only the Python standard library is used, so no pip install needed.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

TIMEOUT = 30


def get_json(url: str):
    with urllib.request.urlopen(url, timeout=TIMEOUT) as r:
        return json.load(r)


def download(url: str, dest: str) -> int:
    with urllib.request.urlopen(url, timeout=TIMEOUT) as r, open(dest, "wb") as f:
        total = 0
        while True:
            chunk = r.read(65536)
            if not chunk:
                break
            f.write(chunk)
            total += len(chunk)
    return total


def ext_from_content_type(content_type: str) -> str:
    return {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(
        content_type.split(";")[0].strip(), "jpg")


def main() -> int:
    parser = argparse.ArgumentParser(description="Pull booth photos to this machine.")
    parser.add_argument("--server", default=os.environ.get("PHOTOBOOTH_SERVER", ""),
                        help="backend base URL (or PHOTOBOOTH_SERVER env)")
    parser.add_argument("--out", default="event-photos", help="local folder")
    args = parser.parse_args()

    if not args.server:
        print("error: --server or PHOTOBOOTH_SERVER is required", file=sys.stderr)
        return 2
    server = args.server.rstrip("/")
    os.makedirs(args.out, exist_ok=True)

    try:
        listing = get_json(f"{server}/api/photos")
    except (urllib.error.URLError, OSError) as e:
        print(f"error: cannot reach {server} ({e})", file=sys.stderr)
        return 1

    new, skipped, failed = 0, 0, []
    videos = 0
    for item in listing.get("photos", []):
        sid = item["session_id"]
        # skip sessions already pulled (photo file OR sidecar present)
        existing = [p for p in os.listdir(args.out) if p.startswith(sid)]
        if existing:
            skipped += 1
            continue
        try:
            with urllib.request.urlopen(item["download_url"], timeout=TIMEOUT) as r:
                ext = ext_from_content_type(r.headers.get_content_type())
                body = r.read()
            with open(os.path.join(args.out, f"{sid}.{ext}"), "wb") as f:
                f.write(body)
            with open(os.path.join(args.out, f"{sid}.json"), "w") as f:
                json.dump(item, f, indent=2)
            new += 1
            if item.get("has_video"):
                video_url = f"{server}/api/photos/{sid}/video"
                with urllib.request.urlopen(video_url, timeout=TIMEOUT) as r:
                    vext = {"video/webm": "webm", "video/mp4": "mp4"}.get(
                        r.headers.get_content_type(), "webm")
                    vbody = r.read()
                with open(os.path.join(args.out, f"{sid}.{vext}"), "wb") as f:
                    f.write(vbody)
                videos += 1
        except (urllib.error.URLError, OSError) as e:
            failed.append(f"{sid} ({e})")

    print(f"pulled {new} new ({videos} with video), {skipped} already have, "
          f"{len(failed)} failed out of {listing.get('count', 0)} on server -> {args.out}")
    for name in failed:
        print(f"  FAILED: {name}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
