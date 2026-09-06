# Portfolio Web Architecture

## Data flow

The site is a static Next.js App Router portfolio. It never imports or runs the Python engines.

1. The source of truth is `C:\dev\omni-engine\portfolio_showcase\data`.
2. The sync step copies that directory to `content/showcase/` in this app. Project metadata lives at `content/showcase/projects/<slug>/project.json`; optional telemetry (`architecture.json`) and narratives (`*.md`) share that folder.
3. `lib/registry.ts` scans only folders with `project.json`. It provides the home-page registry and `generateStaticParams()` for `/projects/[slug]`.
4. `public/showcase/` holds copied images, videos, and canvas output. Files there are served by public URLs; telemetry never provides trusted machine-absolute media paths.

Malformed project metadata, missing telemetry, and a missing timeline degrade to an empty section rather than breaking the registry. A schema-version mismatch skips optional telemetry but preserves the project page.

## Seven-tile radial honeycomb

`components/HexMosaic.tsx` renders the named seven-project cluster:

- Center: `aiwake` — Autonomous Multi-Agent Sentience Engine (Synthetic Consciousness Pipeline)
- Ring, clockwise from 12 o'clock: `ancient_knowledge`, `anna_protocol`, `wonder_feed`, `endless_summer_paradise`, `momma_circle`, `master_mei`

The ring uses six unit vectors around the center: `(0,-1)`, `(0.866,-0.5)`, `(0.866,0.5)`, `(0,1)`, `(-0.866,0.5)`, and `(-0.866,-0.5)`. Each is multiplied by `--hex-ring-distance`, so the ring automatically stays aligned when tile dimensions or gaps change.

The tiles are **flat-top** hexagons. With this orientation those vectors put the six neighbors at 12/2/4/6/8/10 o'clock, with a uniform grout gap.

## 3D rendering model

`app/globals.css` deliberately separates the 3D transform tree from the visual clipping:

```text
.hex-cluster     perspective: 1200px; cluster pan/tilt
  .hex-slot      preserve-3d; radial position
    motion.div   preserve-3d; entrance animation
      .hex-frame preserve-3d; card pan/tilt
        .hex-bg  clip-path + translateZ(--z-bg)
        .hex-layer-mid translateZ(--z-title)
        .hex-layer-top translateZ(--z-badges)
```

Do not put `clip-path`, `overflow: hidden`, opacity below `1`, or a filter on `.hex-frame`, `.hex-slot`, or the motion wrapper. In Blink/WebKit, those grouping properties flatten the 3D context and make `translateZ()` layers render on one plane. Keep clipping exclusively on `.hex-bg`.

`HexCard.tsx` tracks a pointer relative to the individual card center and applies a damped `rotateX`/`rotateY`. `HexMosaic.tsx` independently tracks the pointer over the full cluster and applies a smaller shared tilt. Both reset smoothly when the pointer leaves. `prefers-reduced-motion: reduce` disables the transforms while retaining the same layout and content.

## How to adjust visuals

All global visual controls are grouped and commented at the top of `app/globals.css`.

| Goal | Variable(s) | Recommended range |
| --- | --- | --- |
| Tile size | `--hex-width`, `--hex-height` | Keep height approximately width × `0.866` |
| Grout gap between tiles | `--hex-gap` | `2px`–`8px` |
| Text safe area | `--hex-card-padding` | `16px`–`32px` |
| Individual-card tilt | `--tilt-sensitivity` | `12deg`–`24deg` |
| Whole-cluster tilt | `--cluster-tilt` | `3deg`–`5deg` |
| Background/title/badge depth | `--z-bg`, `--z-title`, `--z-badges` | Keep ascending; title `16px`–`35px`, badges `35px`–`65px` |
| Active card color/glow | `--hex-stone-active`, `--hex-border-active`, `--hex-accent`, `--glow-active` | Preserve text contrast |
| Registry card color/glow | `--hex-stone-registry`, `--hex-border-registry`, `--glow-registry` | Preserve text contrast |

To rearrange the flower, edit `CENTER_SLUG` and the `RING` array in `components/HexMosaic.tsx`. The six vectors should remain in the same order to preserve the radial shape; change only the `slug` values for a simple reordering.

To add a project, add `content/showcase/projects/<slug>/project.json`. It appears automatically in the registry. For it to join the fixed radial flower, assign its slug to a `RING` slot; otherwise it renders below the flower as an overflow tile.

## Local development

```powershell
npm install
npm run dev
```

Next chooses port `3000` unless it is occupied, in which case it reports the alternate local URL (currently `http://localhost:3002`).
