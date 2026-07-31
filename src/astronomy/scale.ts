// A single "compromise" scale, shared by every body, that exaggerates both
// orbital distance and planet size so the whole system reads as a
// planetarium model rather than a mostly-empty void. Not physically
// proportional — tuned by eye so nothing overlaps and everything's visible.

export const SUN_RADIUS = 4;

const ORBIT_BASE = 6; // scene units from origin where the innermost orbit starts
const ORBIT_SPREAD = 10; // multiplies sqrt(AU) to spread orbits outward
const PLANET_RADIUS_SCALE = 0.034; // multiplies cbrt(km)
const MIN_PLANET_RADIUS = 0.25;

export function auToScene(au: number): number {
  return ORBIT_BASE + ORBIT_SPREAD * Math.sqrt(au);
}

export function radiusKmToScene(km: number): number {
  return Math.max(MIN_PLANET_RADIUS, PLANET_RADIUS_SCALE * Math.cbrt(km));
}

// The Moon's real average distance from Earth (~384,400 km, ~0.00257 AU) is
// negligible next to the planetary orbit scale above — running it through
// auToScene would place the Moon's whole orbit inside Earth's own scene
// radius. This is a separate, linear (not sqrt-compressed) scale just for
// the Earth-Moon system, so the real orbit's shape/eccentricity isn't
// distorted, only its absolute size is shrunk to read clearly next to Earth.
const MOON_ORBIT_SCENE_PER_AU = 660; // tuned by eye: avg. distance -> ~1.7 scene units, clear of Earth's radius + the Moon's own

export function moonAuToScene(au: number): number {
  return MOON_ORBIT_SCENE_PER_AU * au;
}
