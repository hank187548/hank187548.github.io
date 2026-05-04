#!/usr/bin/env python3
"""
Convert HEIC images to JPG for the static website.

Default usage:
  python3 convert_heic_to_jpg.py

Convert a specific folder:
  python3 convert_heic_to_jpg.py Videoplusimage/China_Japen
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


DEFAULT_INPUT = Path("Videoplusimage/China_Japen")
SUPPORTED_EXTENSIONS = {".heic", ".heif"}


def convert_with_pillow_heif(source: Path, target: Path, quality: int) -> bool:
    try:
        from PIL import Image
        from pillow_heif import register_heif_opener
    except ImportError:
        return False

    register_heif_opener()
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.save(target, "JPEG", quality=quality, optimize=True, progressive=True)
    return True


def convert_with_system_tool(source: Path, target: Path, quality: int) -> bool:
    tools = [
        ("magick", [str(source), "-quality", str(quality), str(target)]),
        ("convert", [str(source), "-quality", str(quality), str(target)]),
        ("sips", ["-s", "format", "jpeg", "-s", "formatOptions", str(quality), str(source), "--out", str(target)]),
        ("heif-convert", ["-q", str(quality), str(source), str(target)]),
    ]

    for tool, args in tools:
        if not command_exists(tool):
            continue

        result = subprocess.run([tool, *args], check=False, capture_output=True, text=True)
        if result.returncode == 0 and target.exists():
            return True

    return False


def command_exists(command: str) -> bool:
    result = subprocess.run(
        ["bash", "-lc", f"command -v {command}"],
        check=False,
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def iter_heic_files(input_path: Path, recursive: bool) -> list[Path]:
    if input_path.is_file():
        return [input_path] if input_path.suffix.lower() in SUPPORTED_EXTENSIONS else []

    pattern = "**/*" if recursive else "*"
    return sorted(
        path
        for path in input_path.glob(pattern)
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def output_path_for(source: Path, output_dir: Path | None) -> Path:
    if output_dir is None:
        return source.with_suffix(".jpg")

    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir / f"{source.stem}.jpg"


def convert_file(source: Path, target: Path, quality: int, overwrite: bool) -> str:
    if target.exists() and not overwrite:
        return "skipped"

    target.parent.mkdir(parents=True, exist_ok=True)

    if convert_with_pillow_heif(source, target, quality):
        return "converted"

    if convert_with_system_tool(source, target, quality):
        return "converted"

    return "unsupported"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert HEIC/HEIF images to JPG.")
    parser.add_argument(
        "input",
        nargs="?",
        default=str(DEFAULT_INPUT),
        help=f"Input HEIC file or folder. Default: {DEFAULT_INPUT}",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        type=Path,
        help="Optional output folder. Default: save JPG next to each HEIC file.",
    )
    parser.add_argument(
        "-q",
        "--quality",
        type=int,
        default=90,
        help="JPEG quality from 1 to 100. Default: 90.",
    )
    parser.add_argument(
        "-r",
        "--recursive",
        action="store_true",
        help="Search folders recursively.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing JPG files.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)

    if not input_path.exists():
        print(f"Input does not exist: {input_path}", file=sys.stderr)
        return 1

    if not 1 <= args.quality <= 100:
        print("--quality must be between 1 and 100.", file=sys.stderr)
        return 1

    files = iter_heic_files(input_path, args.recursive)
    if not files:
        print(f"No HEIC/HEIF files found in: {input_path}")
        return 0

    counts = {"converted": 0, "skipped": 0, "unsupported": 0}
    for source in files:
        target = output_path_for(source, args.output_dir)
        status = convert_file(source, target, args.quality, args.overwrite)
        counts[status] += 1
        print(f"{status:11} {source} -> {target}")

    if counts["unsupported"]:
        print(
            "\nHEIC support is not available in this environment.\n"
            "Install one option, then run this script again:\n"
            "  python3 -m pip install pillow-heif pillow\n"
            "or install ImageMagick/libheif so `magick` or `heif-convert` is available.",
            file=sys.stderr,
        )
        return 2

    print(
        f"\nDone. Converted: {counts['converted']}, skipped: {counts['skipped']}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
