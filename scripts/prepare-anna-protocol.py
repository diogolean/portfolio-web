"""Prepare Anna Protocol HeyGen reel + pipeline stills for the portfolio."""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.request import Request, urlopen

OMNI = Path(r"C:\dev\omni-engine")
DRIVE_OUTPUTS = Path(
    r"G:\My Drive\Z sosFiles\Z_act\@ NETWORK\@MEDIAUPSCALE_FACTORY_DYNAMIC_CONTENT\Unified Multi-Page Factory\outputs"
)
ANNA_VIDEO = Path(
    r"G:\My Drive\Z sosFiles\Z_act\@ NETWORK\@ Contents\@_Content 2026\The Holistic Legacy - Anna's Protocol\Anna Video Posts - HeyGEN\Anna March Videos\The Architect of Vitality (90s Version)_1080p_caption.mp4"
)
SALES_SOURCE = Path(
    r"C:\Users\Freedom or Death\.cursor\projects\c-dev-apps-portfolio-web\assets\c__Users_Freedom_or_Death_AppData_Roaming_Cursor_User_workspaceStorage_0de06765229e6565b61ec747e0b094d5_images_image-2a752d47-7ce5-4993-9af8-486308a9c974.png"
)
FFMPEG_CANDIDATES = [
    OMNI / ".venv" / "Lib" / "site-packages" / "imageio_ffmpeg" / "binaries" / "ffmpeg-win-x86_64-v7.1.exe",
    Path.home() / "AppData" / "Local" / "Programs" / "Stremio" / "ffmpeg.exe",
]
PUBLIC_IMAGES = Path(__file__).resolve().parents[1] / "public" / "images" / "projects"
B2_PUBLIC_BASE = "https://MediaupscaleStorage.s3.us-east-005.backblazeb2.com"
B2_KEY = "anna_architect_of_vitality_90s_heygen.mp4"

PIPELINE_STILLS = [
    DRIVE_OUTPUTS / "anna_protocol" / "assets" / "rosemary_scalp_and_memory_tonic" / "rosemary_scalp_and_memory_tonic_v20_20260905_181018Z.png",
    DRIVE_OUTPUTS / "anna_protocol" / "assets" / "magnesium_rich_leafy_91dbd3" / "magnesium_rich_leafy_91dbd3_v19_20260905_181015Z.png",
    DRIVE_OUTPUTS / "anna_protocol" / "assets" / "celtic_sea_salt_mineral_3de522" / "celtic_sea_salt_mineral_3de522_v18_20260905_180935Z.png",
    DRIVE_OUTPUTS / "anna_protocol" / "assets" / "morning_sunlight_cortisol_rhythm" / "morning_sunlight_cortisol_rhythm_v16_20260905_180934Z.png",
    DRIVE_OUTPUTS / "anna_protocol" / "assets" / "copper_water_vessel_tradition" / "copper_water_vessel_tradition_v17_20260905_180925Z.png",
    DRIVE_OUTPUTS / "anna_protocol" / "assets" / "turmeric_golden_milk_inflammation" / "turmeric_golden_milk_inflammation_v15_20260905_180847Z.png",
]

sys.path.insert(0, str(OMNI))
from dotenv import load_dotenv

load_dotenv(OMNI / ".env", override=False)

from agents.media.b2_client import B2VideoUploader  # noqa: E402


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
        raise RuntimeError(f"command failed ({proc.returncode}): {cmd[0]}\n{proc.stderr[-1600:]}")


def verify(url: str) -> tuple[int | str, str]:
    try:
        request = Request(url, method="GET")
        request.add_header("Range", "bytes=0-16")
        with urlopen(request, timeout=20) as response:
            return response.status, response.headers.get("Content-Type", "")
    except Exception as exc:
        return type(exc).__name__, str(exc)[:140]


def encode_web_mp4(ffmpeg: str, src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(src),
            "-vf",
            "scale='min(1080,iw)':-2:force_original_aspect_ratio=decrease,format=yuv420p",
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


def encode_webp(ffmpeg: str, src: Path, dest: Path, width: int = 1080) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(src),
            "-vf",
            f"scale={width}:-2",
            "-quality",
            "82",
            str(dest),
        ]
    )


def main() -> int:
    ffmpeg = resolve_ffmpeg()
    print(f"ffmpeg {ffmpeg}")
    if not ANNA_VIDEO.is_file():
        print(f"MISSING video {ANNA_VIDEO}")
        return 1
    missing = [str(path) for path in PIPELINE_STILLS if not path.is_file()]
    if missing:
        for item in missing:
            print(f"MISSING still {item}")
        return 1
    if not SALES_SOURCE.is_file():
        print(f"MISSING sales screenshot {SALES_SOURCE}")
        return 1

    PUBLIC_IMAGES.mkdir(parents=True, exist_ok=True)
    encode_webp(ffmpeg, SALES_SOURCE, PUBLIC_IMAGES / "anna_protocol_storefront.webp", 1400)
    print(f"storefront {PUBLIC_IMAGES / 'anna_protocol_storefront.webp'}")
    for src in PIPELINE_STILLS:
        dest = PUBLIC_IMAGES / f"anna_{src.parent.name}.webp"
        encode_webp(ffmpeg, src, dest, 1080)
        print(f"still {dest.name} ({dest.stat().st_size / 1024:.0f} KB)")

    url = f"{B2_PUBLIC_BASE}/{B2_KEY}"
    status, extra = verify(url)
    if status in (200, 206):
        print(f"skip video already live {status} {extra} {url}")
        return 0

    with tempfile.TemporaryDirectory(prefix="anna-protocol-web-") as tmp:
        dest = Path(tmp) / B2_KEY
        print(f"encode {ANNA_VIDEO.name} ({ANNA_VIDEO.stat().st_size / (1024 * 1024):.1f} MB)")
        encode_web_mp4(ffmpeg, ANNA_VIDEO, dest)
        print(f"web {dest.name} ({dest.stat().st_size / (1024 * 1024):.1f} MB)")
        uploaded = B2VideoUploader("MediaupscaleStorage").upload(dest, content_type="video/mp4")
        print(f"url {uploaded}")
        status, extra = verify(uploaded)
        print(f"verify {status} {extra}")
        return 0 if status in (200, 206) else 1


if __name__ == "__main__":
    raise SystemExit(main())
