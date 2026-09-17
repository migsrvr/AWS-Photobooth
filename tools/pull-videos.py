"""Pull booth clips straight from the Supabase Storage bucket.

Defaults to YESTERDAY (local wall-clock date), so the morning after an
event one command grabs everything recorded the day before. Files land
with their original bucket names and bytes (webm stays webm, mp4 stays
mp4) plus a small `.json` sidecar each.

Usage (PowerShell, repo root):
  py tools/pull-videos.py [--date 2026-09-16] [--all] [--out ./event-videos]

Creds come from backend/.env (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY),
or the same env vars when set. Safe to re-run: files already on disk
are skipped. Only the Python standard library is used.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone

TIMEOUT = 60
VIDEO_EXTS = (".webm", ".mp4")
PAGE_SIZE = 100


def load_dotenv(path: str) -> None:
    """Minimal .env loader (no dependency). Never overrides real env vars."""
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip("'").strip('"')
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        pass


def api_headers(key: str) -> dict:
    return {"apikey": key, "Authorization": f"Bearer {key}"}


def list_objects(url: str, key: str, bucket: str):
    """Yield every object in the bucket (paginated)."""
    offset = 0
    while True:
        req = urllib.request.Request(
            f"{url}/storage/v1/object/list/{bucket}",
            data=json.dumps({
                "prefix": "",
                "limit": PAGE_SIZE,
                "offset": offset,
                "sortBy": {"column": "created_at", "order": "desc"},
            }).encode(),
            headers={**api_headers(key), "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            page = json.load(r)
        if not isinstance(page, list) or not page:
            return
        for obj in page:
            yield obj
        if len(page) < PAGE_SIZE:
            return
        offset += PAGE_SIZE


def download_object(url: str, key: str, bucket: str, name: str, dest: str) -> int:
    req = urllib.request.Request(
        f"{url}/storage/v1/object/{bucket}/{name}", headers=api_headers(key))
    total = 0
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r, open(dest, "wb") as f:
        while True:
            chunk = r.read(65536)
            if not chunk:
                break
            f.write(chunk)
            total += len(chunk)
    return total


def obj_day(created_at: str):
    """Local wall-clock date an object was stored, or None if unparseable."""
    if not created_at:
        return None
    try:
        dt = datetime.fromisoformat(str(created_at).replace("Z", "+00:00"))
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone().date()


def main() -> int:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    parser = argparse.ArgumentParser(description="Pull one day of booth videos from Supabase Storage.")
    parser.add_argument("--out", default=os.path.join(root, "event-videos"),
                        help="local folder (default: ./event-videos)")
    parser.add_argument("--date", default="",
                        help="day to pull as YYYY-MM-DD (default: yesterday)")
    parser.add_argument("--all", action="store_true",
                        help="pull every video in the bucket, ignore date")
    parser.add_argument("--bucket", default=os.environ.get("SUPABASE_BUCKET", "photobooth"),
                        help="storage bucket (default: photobooth)")
    parser.add_argument("--env", default=os.path.join(root, "backend", ".env"),
                        help="dotenv file with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY")
    args = parser.parse_args()

    load_dotenv(args.env)
    url = (os.environ.get("SUPABASE_URL") or "").strip().rstrip("/")
    key = (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    if not url or not key:
        print("error: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing "
              f"(checked env + {args.env})", file=sys.stderr)
        return 2
    if "://" not in url:
        url = "https://" + url

    target = None
    if not args.all:
        try:
            target = (date.fromisoformat(args.date) if args.date
                      else date.today() - timedelta(days=1))
        except ValueError:
            print("error: --date must be YYYY-MM-DD", file=sys.stderr)
            return 2
    os.makedirs(args.out, exist_ok=True)

    try:
        objects = list(list_objects(url, key, args.bucket))
    except (urllib.error.URLError, OSError) as e:
        print(f"error: cannot list bucket {args.bucket} ({e})", file=sys.stderr)
        return 1

    new, skipped, other_day, not_video = 0, 0, 0, 0
    failed = []
    for obj in objects:
        name = obj.get("name", "")
        if not name.lower().endswith(VIDEO_EXTS):
            not_video += 1
            continue
        if target is not None and obj_day(obj.get("created_at")) != target:
            other_day += 1
            continue
        dest = os.path.join(args.out, os.path.basename(name))
        if os.path.exists(dest):
            skipped += 1
            continue
        try:
            size = download_object(url, key, args.bucket, name, dest)
            with open(dest + ".json", "w") as f:
                json.dump({
                    "name": name,
                    "bucket": args.bucket,
                    "created_at": obj.get("created_at"),
                    "bytes": size,
                }, f, indent=2)
            new += 1
        except (urllib.error.URLError, OSError) as e:
            failed.append(f"{name} ({e})")

    day_label = "all days" if target is None else str(target)
    print(f"pulled {new} new videos from {day_label}, {skipped} already have, "
          f"{other_day} from other days, {not_video} non-video, "
          f"{len(failed)} failed out of {len(objects)} objects -> {args.out}")
    for name in failed:
        print(f"  FAILED: {name}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
