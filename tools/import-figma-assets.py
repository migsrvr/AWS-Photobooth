"""Import Figma assets into frontend/src/assets/.

Reads figma-assets.json (same folder), converts downloaded raws to .webp
with Pillow, copies SVGs through unchanged.

Usage (PowerShell, repo root):
  py tools/import-figma-assets.py --src-dir <dir-with-downloaded-raws>

Re-importing later: Figma asset URLs are short-lived, so re-download the
raws via the Figma MCP download_assets tool into a fresh dir (filenames
must match the manifest's "from" values), then re-run this script.
"""
import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: py -m pip install pillow")

TOOLS_DIR = Path(__file__).resolve().parent
OUT_DIR = TOOLS_DIR.parent / "frontend" / "src" / "assets"


def sha10(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:10]


def import_raster(src: Path, dest: Path, quality: int, max_width: int | None) -> tuple[int, int]:
    im = Image.open(src)
    im.load()
    if max_width and im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    before = src.stat().st_size
    im.save(dest, "WEBP", quality=quality, method=6)
    return before, dest.stat().st_size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--src-dir", required=True, help="dir with downloaded raw files")
    args = parser.parse_args()

    src_dir = Path(args.src_dir)
    manifest = json.loads((TOOLS_DIR / "figma-assets.json").read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    total_before = total_after = 0
    for entry in manifest["assets"]:
        src = src_dir / entry["from"]
        dest = OUT_DIR / entry["output"]
        if not src.exists():
            sys.exit(f"missing raw file: {src}")
        if sha10(src) != entry["sha10"]:
            sys.exit(f"hash mismatch for {src} (expected {entry['sha10']}, re-download raws?)")
        if entry.get("copy"):
            shutil.copyfile(src, dest)
            size = dest.stat().st_size
            print(f"copy  {entry['from']} -> {entry['output']} ({size} B)")
            total_before += size
            total_after += size
        else:
            before, after = import_raster(src, dest, entry["quality"], entry.get("max_width"))
            total_before += before
            total_after += after
            print(f"webp  {entry['from']} -> {entry['output']} "
                  f"q={entry['quality']} {before // 1024}KB -> {after // 1024}KB")

    print(f"total {total_before // 1024}KB -> {total_after // 1024}KB "
          f"({100 * (1 - total_after / total_before):.0f}% smaller)")


if __name__ == "__main__":
    main()
