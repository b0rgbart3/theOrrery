---
name: run-solarsystem
description: Build, run, and drive the solarSystem Vite/React/Three.js app. Use when asked to start solarSystem, run it, screenshot its UI, or verify a change actually renders (orbit controls, planets, bloom, etc).
---

This is a Vite + React 19 + `@react-three/fiber` single-page app (no backend yet). Drive it with
the committed Playwright driver at `.claude/skills/run-solarsystem/driver.mjs` — it starts the dev
server itself if needed, loads the page in headless Chromium, drags the canvas to exercise
`OrbitControls`, screenshots before/after, and reports any console/page errors.

## Prerequisites

Node.js + npm. No OS packages needed — Playwright's bundled Chromium runs headless without `xvfb`
on macOS/Linux for this project (no GPU-only features in use).

## Setup

```bash
npm install                    # installs react-three-fiber/drei/postprocessing, astronomy-engine, playwright, etc.
npx playwright install chromium   # downloads the Chromium build Playwright drives (only needed once per machine)
```

## Run (agent path)

```bash
node .claude/skills/run-solarsystem/driver.mjs
```

This is the whole harness — no tmux/REPL needed since it's a single headless-browser session, not
an interactive one. What it does:

1. Checks `http://localhost:5173`; if nothing's listening, spawns `npm run dev` itself (detached)
   and waits up to 30s for it to come up.
2. Loads the page, waits for the `<canvas>` to appear and the first frames/bloom to settle.
3. Screenshots, then drags across the canvas (mousedown → move → mouseup) to prove
   `OrbitControls` actually responds to input, and screenshots again.
4. If it started the dev server itself, kills it (whole process group, so the port is free
   afterward).
5. Prints a JSON result and exits non-zero if any console/page error was seen.

Screenshots land in `.claude/skills/run-solarsystem/screenshots/` as `before-drag.png` and
`after-drag.png` (gitignored — regenerated each run). A successful run's JSON looks like:

```json
{ "ok": true, "errors": [], "screenshots": { "before": "...", "after": "..." } }
```

Compare `before-drag.png` and `after-drag.png` visually — the view should have visibly rotated
(e.g. surface detail shifted from lower-right to upper-left) if `OrbitControls` is working.

Optional flags: `--url=http://localhost:5173` (target a different port/host), `--outDir=<path>`
(change screenshot destination).

## Run (human path)

```bash
npm run dev   # → prints a local URL (default http://localhost:5173); Ctrl-C to stop
```

## Build

```bash
npm run build   # tsc -b && vite build — only needed for a production bundle, not for driving/testing
```

## Test

No test suite yet — correctness for this project is judged visually (see `driver.mjs` screenshots)
against known references, not unit tests.

## Gotchas

- **No `chromium-cli` on this machine.** The `/run` skill's default web-app pattern assumes
  `chromium-cli`; it wasn't installed here, so `playwright` was added as a project devDependency
  and `driver.mjs` uses it directly (`import { chromium } from "playwright"`) instead.
- **`npm doesn't forward SIGTERM`** to whatever it spawns. `driver.mjs` launches `npm run dev`
  with `detached: true` and kills the whole process group (`process.kill(-pid, "SIGTERM")`) —
  killing just the returned `pid` leaves the actual Vite server (and port 5173) running.
- **macOS bash has no `timeout` command** (no GNU coreutils by default). Don't use
  `timeout 30 bash -c '...'` to poll readiness on this machine — use a manual retry loop instead
  (which is what `driver.mjs`'s `waitFor()` does internally).

## Troubleshooting

- **`Error: Cannot find module 'playwright'`**: you ran a script outside this project, or before
  `npm install`. `playwright` is a devDependency of this project specifically — run
  `node .claude/skills/run-solarsystem/driver.mjs` from the project root after `npm install`.
- **`EADDRINUSE` on port 5173**: a previous dev server is still running. Free it with
  `lsof -ti:5173 -sTCP:LISTEN | xargs -r kill` before rerunning.
