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
//
// The exaggeration has to stay bounded on both sides: big enough to clear
// Earth's own scene radius (0.63) plus the Moon's (0.17), but nowhere near
// Earth's gap to its nearest neighboring orbit — Venus's ring sits only
// ~1.48 scene units inside Earth's (16 - 14.5), the tightest gap of any
// planet pair here. An earlier value (660, ~1.7 avg.) actually exceeded that
// whole gap, making the Moon's orbit visibly cross into Venus's ring. 390
// keeps the average at ~1.0 — comfortable clearance from Earth's own surface
// on one side, and using well under half of the Venus gap on the other.
const MOON_ORBIT_SCENE_PER_AU = 390;

export function moonAuToScene(au: number): number {
  return MOON_ORBIT_SCENE_PER_AU * au;
}

// The Moon is the only body actually seen right next to another body at
// close range, so its size is what makes the Earth/Moon comparison read as
// right or wrong. Running its radius through the same cbrt(km) curve as the
// planets (tuned to keep Mercury from vanishing next to Neptune) compresses
// the real ~3.7x Earth/Moon ratio down to ~1.5x — next to Earth specifically,
// that reads as an oversized moon. Scaling it as a true proportion of
// Earth's own (already-exaggerated) scene radius instead keeps that one
// comparison physically correct.
const EARTH_RADIUS_KM = 6371;

export function moonRadiusToScene(moonRadiusKm: number): number {
  return radiusKmToScene(EARTH_RADIUS_KM) * (moonRadiusKm / EARTH_RADIUS_KM);
}
