"""Transcode the newest Wonder Feed / Momma Circle clips for web and upload to B2."""

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
FFMPEG_CANDIDATES = [
    OMNI / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe",
    Path.home() / "AppData" / "Local" / "Programs" / "Stremio" / "ffmpeg.exe",
]
POSTER_DIR = Path(__file__).resolve().parents[1] / "public" / "videos" / "posters"

sys.path.insert(0, str(OMNI))
from dotenv import load_dotenv

load_dotenv(OMNI / ".env", override=False)

from agents.media.b2_client import B2VideoUploader  # noqa: E402

# Newest six complete shipped clips per channel (clips/ only — skip Reproved / @Experiments).
CLIPS: dict[str, list[Path]] = {
    "wonder_feed": [
        DRIVE / "wonder_feed" / "clips" / "lofi_reel_grief_learning_to_carry_it_20260912_055532_v01.mp4",
        DRIVE / "wonder_feed" / "clips" / "lofi_reel_distance_silence_that_speaks_20260912_053648_v01.mp4",
        DRIVE / "wonder_feed" / "clips" / "lofi_reel_grief_learning_to_carry_it_20260912_051957_v01.mp4",
        DRIVE / "wonder_feed" / "clips" / "lofi_reel_distance_silence_that_speaks_20260912_050447_v01.mp4",
        DRIVE / "wonder_feed" / "clips" / "lofi_reel_perseverance_getting_up_anyway_20260912_044140_v01.mp4",
        DRIVE / "wonder_feed" / "clips" / "lofi_reel_grief_learning_to_carry_it_20260912_041125_v01.mp4",
    ],
    "momma_circle": [
        DRIVE / "momma_circle" / "clips" / "lofi_reel_self_compassion_good_enough_mother_20260912_060212_v01.mp4",
        DRIVE / "momma_circle" / "clips" / "lofi_reel_presence_phones_down_eye_contact_20260912_054415_v01.mp4",
        DRIVE / "momma_circle" / "clips" / "lofi_reel_sleep_routines_as_safety_20260912_052741_v01.mp4",
        DRIVE / "momma_circle" / "clips" / "lofi_reel_self_compassion_good_enough_mother_20260912_051136_v01.mp4",
        DRIVE / "momma_circle" / "clips" / "lofi_reel_presence_phones_down_eye_contact_20260912_045351_v01.mp4",
        DRIVE / "momma_circle" / "clips" / "lofi_reel_sleep_routines_as_safety_20260912_042524_v01.mp4",
    ],
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


def encode_web_mp4(ffmpeg: str, src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(src),
            "-vf",
            "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
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
        with urlopen(request, timeout=20) as response:
            return response.status, response.headers.get("Content-Type", "")
    except Exception as exc:
        return type(exc).__name__, str(exc)[:140]


def main() -> int:
    ffmpeg = resolve_ffmpeg()
    print(f"ffmpeg {ffmpeg}")

    missing = [
        f"{slug}: {path}"
        for slug, paths in CLIPS.items()
        for path in paths
        if not path.is_file()
    ]
    if missing:
        for item in missing:
            print(f"MISSING {item}")
        return 1

    uploader = B2VideoUploader("MediaupscaleStorage")
    results: list[tuple[str, Path, str, float, float]] = []

    with tempfile.TemporaryDirectory(prefix="portfolio-web-videos-") as tmp:
        tmp_root = Path(tmp)
        for slug, paths in CLIPS.items():
            extract_poster(ffmpeg, paths[0], POSTER_DIR / f"{slug}.webp")
            print(f"poster {POSTER_DIR / f'{slug}.webp'}")
            for src in paths:
                dest = tmp_root / src.name
                print(f"\nencode {slug} <- {src.name} ({src.stat().st_size / (1024 * 1024):.1f} MB)")
                encode_web_mp4(ffmpeg, src, dest)
                web_mb = dest.stat().st_size / (1024 * 1024)
                print(f"web    {dest.name} ({web_mb:.1f} MB)")
                url = uploader.upload(dest, content_type="video/mp4")
                print(f"url    {url}")
                results.append((slug, src, url, src.stat().st_size / (1024 * 1024), web_mb))

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
