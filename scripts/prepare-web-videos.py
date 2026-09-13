"""Transcode curated project clips for web and upload to B2."""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.request import Request, urlopen

OMNI = Path(r"C:\dev\omni-engine")
DRIVE = Path(
    r"G:\My Drive\Z sosFiles\Z_act\@ NETWORK\@MEDIAUPSCALE_FACTORY_DYNAMIC_CONTENT\Unified Multi-Page Factory\outputs"
)
ESP_PROD = Path(
    r"G:\My Drive\Z sosFiles\Z_act\@ NETWORK\@ MEDIAUPSCALE_FACTORY\Endless_Summers_Paradise - Production"
)
FFMPEG_CANDIDATES = [
    OMNI / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe",
    Path.home() / "AppData" / "Local" / "Programs" / "Stremio" / "ffmpeg.exe",
]
POSTER_DIR = Path(__file__).resolve().parents[1] / "public" / "videos" / "posters"

print("boot prepare-web-videos", flush=True)
sys.path.insert(0, str(OMNI))
from dotenv import load_dotenv

load_dotenv(OMNI / ".env", override=False)
print("env loaded", flush=True)

from agents.media.b2_client import B2VideoUploader  # noqa: E402
print("b2 client ready", flush=True)

B2_PUBLIC_BASE = "https://MediaupscaleStorage.s3.us-east-005.backblazeb2.com"

# ESP: first six YouTube-scheduled masters (publishAt order from esp_schedule_result.json).
# Master Mei: six newest complete clips/ files.
CLIPS: dict[str, list[Path]] = {
    "endless_summer_paradise": [
        ESP_PROD / "Everbloom_Vista_Springs_1777349707_V3_LIVE" / "Everbloom_Vista_Springs_1777349707_V3_LIVE_ULTIMATE_MASTER.mp4",
        ESP_PROD / "Candid_Mirage_Social_1777412520_V4_LIVE" / "Candid_Mirage_Social_1777412520_V4_LIVE_ULTIMATE_MASTER.mp4",
        ESP_PROD / "Evergleam_Aqua_Mirage_1777612128_V4_LIVE" / "Evergleam_Aqua_Mirage_1777612128_V4_LIVE_ULTIMATE_MASTER.mp4",
        ESP_PROD / "Paradise_Dream_Garden_1777825618_V4_LIVE" / "Paradise_Dream_Garden_1777825618_V4_LIVE_ULTIMATE_MASTER.mp4",
        ESP_PROD / "Candid_Chroma_Mirage_1777831839_V4_LIVE" / "Candid_Chroma_Mirage_1777831839_V4_LIVE_ULTIMATE_MASTER.mp4",
        ESP_PROD / "Paradise_Dream_Garden_1778008697_V4_LIVE" / "Paradise_Dream_Garden_1778008697_V4_LIVE_ULTIMATE_MASTER.mp4",
    ],
    "master_mei": [
        DRIVE / "master_mei" / "clips" / "reel_are_you_still_chained__watching__v01.mp4",
        DRIVE / "master_mei" / "clips" / "reel_does_fleeting_pleasure_secretly__v01.mp4",
        DRIVE / "master_mei" / "clips" / "reel_who_holds_the_keys_to_your_self__v01.mp4",
        DRIVE / "master_mei" / "clips" / "reel_will_you_command_your_ascent__or_v01.mp4",
        DRIVE / "master_mei" / "clips" / "reel_who_controls_the_map_of_your_min_v04.mp4",
        DRIVE / "master_mei" / "clips" / "reel_is_your_inner_sovereign_exiled_b_v05.mp4",
    ],
}
ORIENTATION: dict[str, str] = {
    "endless_summer_paradise": "landscape",
    "master_mei": "portrait",
}
SCALE = {
    "portrait": "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
    "landscape": "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
}


def resolve_ffmpeg() -> str:
    which = shutil.which("ffmpeg")
    if which:
        return which
    for candidate in FFMPEG_CANDIDATES:
        if candidate.is_file():
            return str(candidate)
    raise RuntimeError("ffmpeg not found")


def run(cmd: list[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"command failed ({proc.returncode}): {cmd[0]}\n{proc.stderr[-1200:]}")


def encode_web_mp4(ffmpeg: str, src: Path, dest: Path, orientation: str) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(src),
            "-vf",
            SCALE[orientation],
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "26",
            "-profile:v",
            "high",
            "-level",
            "4.1",
            "-c:a",
            "aac",
            "-b:a",
            "96k",
            "-ac",
            "2",
            "-movflags",
            "+faststart",
            str(dest),
        ]
    )


def extract_poster(ffmpeg: str, src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            ffmpeg,
            "-y",
            "-ss",
            "1.6",
            "-i",
            str(src),
            "-frames:v",
            "1",
            "-vf",
            "scale=720:-2",
            str(dest),
        ]
    )


def verify(url: str) -> tuple[int | str, str]:
    try:
        request = Request(url, method="GET")
        request.add_header("Range", "bytes=0-16")
        with urlopen(request, timeout=12) as response:
            return response.status, response.headers.get("Content-Type", "")
    except Exception as exc:
        return type(exc).__name__, str(exc)[:140]


def main() -> int:
    selected = set(sys.argv[1:])
    clips = {slug: paths for slug, paths in CLIPS.items() if not selected or slug in selected}
    if not clips:
        print("no matching slugs")
        return 1

    ffmpeg = resolve_ffmpeg()
    print(f"ffmpeg {ffmpeg}", flush=True)

    missing: list[str] = []
    for slug, paths in clips.items():
        for path in paths:
            print(f"check  {slug} {path.name}", flush=True)
            if not path.is_file():
                missing.append(f"{slug}: {path}")
    if missing:
        for item in missing:
            print(f"MISSING {item}")
        return 1

    uploader = B2VideoUploader("MediaupscaleStorage")
    results: list[tuple[str, Path, str, float, float]] = []

    with tempfile.TemporaryDirectory(prefix="portfolio-web-videos-") as tmp:
        tmp_root = Path(tmp)
        for slug, paths in clips.items():
            extract_poster(ffmpeg, paths[0], POSTER_DIR / f"{slug}.webp")
            print(f"poster {POSTER_DIR / f'{slug}.webp'}")
            orientation = ORIENTATION.get(slug, "portrait")
            for src in paths:
                url = f"{B2_PUBLIC_BASE}/{src.name}"
                src_mb = src.stat().st_size / (1024 * 1024)
                live_status, _ = verify(url)
                if live_status in (200, 206):
                    print(f"\nskip   {slug} {src.name} (already on B2)")
                    results.append((slug, src, url, src_mb, src_mb))
                    continue
                dest = tmp_root / src.name
                print(f"\nencode {slug} {orientation} <- {src.name} ({src_mb:.1f} MB)")
                encode_web_mp4(ffmpeg, src, dest, orientation)
                web_mb = dest.stat().st_size / (1024 * 1024)
                print(f"web    {dest.name} ({web_mb:.1f} MB)")
                url = uploader.upload(dest, content_type="video/mp4")
                print(f"url    {url}")
                results.append((slug, src, url, src_mb, web_mb))

    print("\n=== VERIFY ===")
    failed = False
    for slug, src, url, src_mb, web_mb in results:
        status, extra = verify(url)
        print(f"{slug}\t{status}\t{extra}\t{src_mb:.1f}->{web_mb:.1f} MB\t{src.name}")
        if status not in (200, 206):
            failed = True
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
