import * as Astronomy from "astronomy-engine";
import { auToScene } from "./scale";
import { PLANETS } from "../data/planets";

// astronomy-engine's HelioVector returns equatorial J2000 (EQJ) coordinates.
// Rotate into ecliptic J2000 (ECL) so the shared orbital plane maps onto the
// scene's XZ ground plane, with the small out-of-plane component (z) mapped
// onto scene Y — that's what makes an inclined orbit like Mercury's visibly
// bob above/below the mean plane instead of everything looking artificially flat.
const EQJ_TO_ECL = Astronomy.Rotation_EQJ_ECL();

export function heliocentricScenePosition(planetName: string, date: Date): [number, number, number] {
  const body = Astronomy.Body[planetName as keyof typeof Astronomy.Body];
  const equatorial = Astronomy.HelioVector(body, date);
  const ecliptic = Astronomy.RotateVector(EQJ_TO_ECL, equatorial);

  const distanceAu = ecliptic.Length();
  const sceneDistance = auToScene(distanceAu);
  const scale = distanceAu === 0 ? 0 : sceneDistance / distanceAu;

  // (eclX, eclZ, eclY) would swap two axes, which is a reflection (flips
  // handedness) rather than a rotation — that silently reversed the apparent
  // direction of orbital motion to clockwise when viewed from above, while
  // the Sun's independently-coded spin stayed counter-clockwise (correct).
  // Negating eclY here restores a proper orientation-preserving mapping, so
  // real prograde motion reads as counter-clockwise from above, matching
  // both reality and the Sun's spin.
  return [ecliptic.x * scale, ecliptic.z * scale, -ecliptic.y * scale];
}

// Position for any selection key: a known planet name resolves to its live
// position, anything else (the Sun, "overview") is the origin — the Sun sits
// at the heliocentric frame's center by definition, and "overview" has no
// body to track.
export function scenePositionForKey(key: string, date: Date): [number, number, number] {
  const planet = PLANETS.find((p) => p.name === key);
  return planet ? heliocentricScenePosition(planet.name, date) : [0, 0, 0];
}
