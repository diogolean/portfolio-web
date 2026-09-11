"""Upload missing portfolio showcase videos to Backblaze B2 and print live URLs."""

from __future__ import annotations

import sys
from pathlib import Path
from urllib.request import Request, urlopen

OMNI = Path(r"C:\dev\omni-engine")
DRIVE = Path(
    r"G:\My Drive\Z sosFiles\Z_act\@ NETWORK\@MEDIAUPSCALE_FACTORY_DYNAMIC_CONTENT\Unified Multi-Page Factory\outputs"
)
ESP_PROD = Path(
    r"G:\My Drive\Z sosFiles\Z_act\@ NETWORK\@ MEDIAUPSCALE_FACTORY\Endless_Summers_Paradise - Production"
)

sys.path.insert(0, str(OMNI))
from dotenv import load_dotenv

load_dotenv(OMNI / ".env", override=False)

from agents.media.b2_client import B2VideoUploader  # noqa: E402

UPLOADS: dict[str, Path] = {
    "aiwake": DRIVE / "aiwake" / "aiwake_debate_20260902_074022_cc7f88.mp4",
    "wonder_feed": DRIVE
    / "wonder_feed"
    / "clips"
    / "lofi_reel_perseverance_getting_up_anyway_20260911_044441_v01.mp4",
    "momma_circle": DRIVE
    / "momma_circle"
    / "clips"
    / "lofi_reel_sleep_routines_as_safety_20260911_050121_v01.mp4",
    "endless_summer_paradise": ESP_PROD
    / "The_Terminus_1778730630_V4_LIVE"
    / "The_Terminus_1778730630_V4_LIVE_ULTIMATE_MASTER.mp4",
}


def verify(url: str) -> tuple[int | str, str]:
    try:
        request = Request(url, method="GET")
        request.add_header("Range", "bytes=0-16")
        with urlopen(request, timeout=20) as response:
            return response.status, response.headers.get("Content-Type", "")
    except Exception as exc:
        return type(exc).__name__, str(exc)[:140]


def main() -> int:
    missing = [slug for slug, path in UPLOADS.items() if not path.is_file()]
    if missing:
        for slug in missing:
            print(f"MISSING local file for {slug}: {UPLOADS[slug]}")
        return 1

    uploader = B2VideoUploader("MediaupscaleStorage")
    results: dict[str, str] = {}
    for slug, path in UPLOADS.items():
        print(f"\n=== {slug} ===")
        print(f"source {path} ({path.stat().st_size / (1024 * 1024):.1f} MB)")
        url = uploader.upload(path, content_type="video/mp4")
        results[slug] = url
        print(f"url {url}")

    print("\n=== VERIFY ===")
    failed = False
    for slug, url in results.items():
        status, extra = verify(url)
        print(f"{slug}\t{status}\t{extra}\t{url}")
        if status not in (200, 206):
            failed = True
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
