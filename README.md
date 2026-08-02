# The Orrery

An interactive, planetarium-style 3D visualization of the solar system: the Sun at the center of
orbital control, all eight planets visible on screen at once, with a single compromise scale that
exaggerates both planet size and orbital distance so the whole system reads as a recognizable
model rather than a mostly-empty void. Planet positions are computed from real ephemeris data
(via `astronomy-engine`), with a scrubbable timeline for moving through past and future dates.

Built as a companion piece to [synchronicity](https://github.com/b0rgbart3/synchronicity), an
Earth-centered 3D globe visualization — this project reuses parts of its tech stack but scales the
scope out to the whole system instead of one planet and its moon.

## Tech stack

| Layer              | Technology                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| Frontend framework | React 19 + TypeScript                                                               |
| 3D rendering       | Three.js via `@react-three/fiber`                                                   |
| Post-processing    | `@react-three/postprocessing` (bloom)                                               |
| 3D helpers         | `@react-three/drei`                                                                 |
| Build tool         | Vite                                                                                |
| Styles             | Sass                                                                                |
| Planetary position | `astronomy-engine` (NASA-derived, MIT) — heliocentric vectors for all planets (`HelioVector`) |

Not part of the stack yet, but planned as a later add-on (see Roadmap below):

| Layer              | Technology                                          |
| ------------------ | ---------------------------------------------------- |
| Backend runtime    | Node.js + TypeScript (`tsx`)                        |
| Backend transport  | WebSockets (`ws`)                                   |
| Live data source   | ISS real-time position tracking                     |

There's no backend and no monorepo/workspaces setup right now — all astronomy math runs
client-side, since `astronomy-engine` works fine in the browser. A Node/WebSocket backend only
gets introduced once real-time ISS tracking is built, since that's the piece that actually needs
a server (to proxy a live ISS API).

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

## Assets

Planet/Sun textures live in `public/textures/` and are sourced from
[Solar System Scope](https://www.solarsystemscope.com/textures/) under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — see `public/textures/NOTICE.md`.

## Roadmap

Built in stages:

1. ✅ Sun only — textured sphere, subtle bloom, basic orbit controls.
2. ✅ All 8 planets at a fixed layout, compromise scale, orbit rings, click-to-focus camera.
3. ✅ Real planet positions via `astronomy-engine`'s `HelioVector`, computed for "now" at page load.
4. ✅ Scrubbable/playable timeline driving those positions continuously (play/pause, speed presets, scrub slider, "Now" reset — all bodies, camera focus, and the tooltip track the live simulation clock).
5. ✅ Real (elliptical) orbit paths sampled over each planet's actual orbital period.
6. Polish — starfield ✅, per-planet axial tilt ✅, click tooltips with real facts ✅, Saturn's ring ✅, real sidereal self-rotation ✅. Still open: Earth's Moon.
7. Real-time ISS tracking (low priority) — the first feature that will need a backend.
