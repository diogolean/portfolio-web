# Build Ticket #001 — prototype setup

## Install & run
```bash
cd apps/portfolio-web
npm install
npm run dev
```

## Before it renders real projects
This app reads from `content/showcase/projects/` and `public/showcase/`, which
the CI rsync step in FRONTEND_BLUEPRINT.md §3.3 populates from
`portfolio_showcase/data` and `portfolio_showcase/assets`. Until that copy
step runs, `/` renders an empty factory with HTTP 200 (per §3.3's own rule) —
that is expected, not a bug. To see real cards today, either:

- run the rsync commands from §3.3 by hand once, or
- drop a couple of real `project.json` files under
  `apps/portfolio-web/content/showcase/projects/<slug>/project.json` to
  smoke-test the mosaic and the four beats.

## What's deliberately NOT in this pass
- No `react-three-fiber` / Three.js / WebGL anywhere — the mosaic is CSS
  `clip-path` + `transform: perspective()`, 0kb of 3D libraries.
- No shared-element hexagon-to-page morph — `app/template.tsx` does a plain
  0.25s crossfade. A fancier transition is a separate ticket once this is
  live and measured.
- MDX narrative files render through `gray-matter` + `marked` (plain HTML),
  not a full MDX compiler — swap in `next-mdx-remote` later if you need JSX
  inside narrative markdown.
- No `GlobalTimeline` component file yet — the home page inlines a minimal
  version of it directly; split it out once the real timeline JSON exists.

## Perf checklist before you call this "done"
- [ ] Run Lighthouse — this stack should score 100 on Performance with zero
      extra work, since there's nothing heavy to lazy-load. If it doesn't,
      look at unoptimized images first (`next/image` isn't wired in yet for
      the poster/diagram `<img>` tags in `ProjectHero` — swap those in).
  