# The Orrery

An interactive, planetarium-style 3D visualization of the solar system: the Sun at the center of
orbital control, all eight planets visible on screen at once, with a single compromise scale that
exaggerates both planet size and orbital distance so the whole system reads as a recognizable
model rather than a mostly-empty void. Planet positions are computed from real ephemeris data
(via `astronomy-engine`), with a scrubbable timeline for moving through past and future dates.
Also includes two overlay layers for reading real zodiac signs directly off the model — Earth's
traditional "sun sign," and, separately, every other planet's true geocentric sign — see
[Zodiac layers](#zodiac-layers) below.

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
| Planetary position | `astronomy-engine` (NASA-derived, MIT) — heliocentric vectors (`HelioVector`) for scene placement; geocentric vectors (`GeoVector`) and `SunPosition` for the true zodiac sign layer |

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

You can also control the speed of time, and even reverse it, by using the timeline at the bottom
of the screen. You can also toggle on and off various features of the Orrery, such as the zodiac
ring, planetary zodiac rays, and more, by clicking on the settings button in the top right corner.

## Zodiac layers

The app has two, mutually-exclusive zodiac overlays (Settings panel), reflecting two genuinely
different astronomical quantities:

- **Heliocentric Zodiac layer** — a ring centered on the **Sun**, plotting each planet's
  **heliocentric** position (its direction as seen from the Sun). This happens to give the correct
  traditional "sun sign" for Earth itself: Earth's heliocentric position and the Sun's geocentric
  position (the one astrology actually uses) always sit exactly opposite one another, so the
  180°-shifted ring lines up by a coincidence that's specific to the Earth/Sun pair. It does
  **not** give the correct sign for any other planet — Mercury's position on this ring, for
  example, does not match what an astrologer would call Mercury's sign.
- **Other planet zodiac signs** — per-planet checkboxes that each draw a ray from Earth through
  that planet, crossing a second ring centered on **Earth** instead of the Sun. This is the real
  (**geocentric**) sign, computed directly from `astronomy-engine`'s `GeoVector` + `Ecliptic`, and
  matches the number shown in the planet's on-screen label exactly (same underlying value, not an
  independent approximation). Because the scene compresses every planet's distance from the Sun
  nonlinearly (see `scale.ts`) to fit the whole system on screen, a planet's true distance from
  Earth doesn't generally land at the same point as its own (differently-compressed) mesh — so
  each ray also carries a second "distance" marker, at the planet's real Earth-relative distance
  under that same compression, linked back to the planet's mesh with a short connecting line.

Selecting the Heliocentric layer clears any selected planets and vice versa, since only one ring
can be shown at a time — see the in-app About panel for the full explanation with a diagram.

### Geocentric vs. heliocentric astrology

Why do we use a geocentric zodiac model, and why are horoscopes almost exclusively geocentric?
Because astrology interprets planetary movements and celestial events based on how they are
experienced from *Earth*, astrological charts are calculated using Earth as the fixed central
point.

- **Geocentric (Earth-centered)** — standard astrological horoscopes map the positions of the
  Sun, Moon, and planets against the backdrop of the zodiac from an Earth-bound perspective.
  Concepts central to traditional astrology — such as apparent planetary retrograde motion, the
  Horizon (Ascendant/Descendant), and the House system — rely on an Earth-centered point of view.
- **Heliocentric (Sun-centered)** — while rare, heliocentric horoscopes do exist within niche
  branches of modern astrology and financial astrology. In a heliocentric chart, the Sun is
  placed at the center, Earth is plotted as a planet opposite the Sun, and retrograde motion
  disappears since all planets orbit the Sun in the same direction. If you want to chart that,
  use the Heliocentric Zodiac layer in this Orrery to see the planets' positions from the Sun's
  perspective.

### Why is this a useful fiction?

This Orrery, like any orrery, is a fiction — a simplified model, not a literal picture of the
solar system or of astrology's underlying celestial mechanics. But the relationships between the
two zodiac systems shown here are genuinely complex, and hard to hold in your head from
description alone. The goal of this Orrery is to make those relationships **visible** and
animated over time, as a way of seeing and understanding those movements rather than just reading
about them. That's especially useful for something like retrograde motion — watching it play out
visually makes it much easier to understand why a planet would appear to go retrograde in the
first place. And why, for example, Mercury appears to go retrograde more often than the other
planets do.

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
6. Polish — starfield ✅, per-planet axial tilt ✅, click tooltips with real facts ✅, Saturn's ring ✅, real sidereal self-rotation ✅, Earth's Moon ✅ (only rendered once the camera is close enough to Earth to read as separate from it, rather than cluttering the system-wide overview), jump-to-date entry ✅.
7. ✅ Zodiac layers — see [Zodiac layers](#zodiac-layers) above.
8. Real-time ISS tracking (low priority) — the first feature that will need a backend.
