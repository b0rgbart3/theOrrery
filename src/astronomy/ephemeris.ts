import * as Astronomy from "astronomy-engine";
import { Matrix4, Quaternion, Vector3 } from "three";
import { auToScene, moonAuToScene } from "./scale";
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

// The Moon's position relative to Earth's center, in scene units — using
// moonAuToScene (a separate, linear scale) rather than the planetary
// auToScene, which would place it inside Earth's own scene radius (see
// scale.ts). Same EQJ->ECL->scene axis handling as heliocentricScenePosition.
export function moonSceneOffsetFromEarth(date: Date): [number, number, number] {
  const equatorial = Astronomy.GeoMoon(date);
  const ecliptic = Astronomy.RotateVector(EQJ_TO_ECL, equatorial);

  const distanceAu = ecliptic.Length();
  const sceneDistance = moonAuToScene(distanceAu);
  const scale = distanceAu === 0 ? 0 : sceneDistance / distanceAu;

  return [ecliptic.x * scale, ecliptic.z * scale, -ecliptic.y * scale];
}

export function moonScenePosition(date: Date): [number, number, number] {
  const [ex, ey, ez] = heliocentricScenePosition("Earth", date);
  const [ox, oy, oz] = moonSceneOffsetFromEarth(date);
  return [ex + ox, ey + oy, ez + oz];
}

// Rotates an EQJ-frame direction vector into scene space, via the same
// EQJ->ECL rotation and axis remap used for positions above. Valid for
// directions (not just points) because both steps are proper (determinant
// +1) rotations, which preserve angles and cross products.
function eqjDirectionToScene(v: Vector3, referenceTime: Astronomy.AstroTime): Vector3 {
  const rotated = Astronomy.RotateVector(EQJ_TO_ECL, new Astronomy.Vector(v.x, v.y, v.z, referenceTime));
  return new Vector3(rotated.x, rotated.z, -rotated.y);
}

// The Moon's true physical orientation (tidal lock + real libration) at a
// given date, as a quaternion ready to apply directly to the mesh — derived
// from astronomy-engine's IAU rotation-axis model rather than a naive spin
// phase, so the same hemisphere keeps facing Earth at any simulated date,
// including while playing or scrubbing.
export function moonOrientationQuaternion(date: Date): Quaternion {
  const axis = Astronomy.RotationAxis(Astronomy.Body.Moon, date);
  const northEqj = new Vector3(axis.north.x, axis.north.y, axis.north.z);

  // Ascending node of the Moon's equator on the EQJ equator: Z_eqj x north.
  const nodeEqj = new Vector3(-northEqj.y, northEqj.x, 0).normalize();

  // Prime-meridian direction: the node rotated by the IAU spin angle around
  // the north pole (Rodrigues' rotation formula; node is already
  // perpendicular to north, so the "parallel" term drops out).
  const spinRad = (axis.spin * Math.PI) / 180;
  const meridianEqj = nodeEqj
    .clone()
    .multiplyScalar(Math.cos(spinRad))
    .addScaledVector(northEqj.clone().cross(nodeEqj), Math.sin(spinRad));

  const northScene = eqjDirectionToScene(northEqj, axis.north.t).normalize();
  // Three.js's SphereGeometry has its texture's horizontal center (u=0.5) on
  // local +X at the equator — which is where lunar equirectangular maps
  // center their near-side maria — so aligning +X with the physical
  // sub-Earth meridian is what makes the familiar near side actually face
  // Earth as the Moon orbits.
  const xAxis = eqjDirectionToScene(meridianEqj, axis.north.t).normalize();
  const yAxis = northScene;
  const zAxis = new Vector3().crossVectors(xAxis, yAxis).normalize();
  xAxis.crossVectors(yAxis, zAxis).normalize(); // re-orthogonalize against north

  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(xAxis, yAxis, zAxis));
}

// The planet's true astrological sign: geocentric ecliptic longitude (the
// Earth->planet direction, in the standard 0-360, 0=Aries convention) rather
// than the heliocentric longitude used elsewhere in this file for scene
// placement. Despite its name, astronomy-engine's own `EclipticLongitude`
// function is actually HELIOCENTRIC (Sun->body; it even throws for the Sun
// itself) -- the geocentric value needed here instead comes from GeoVector
// (Earth->body, with aberration correction for the body's true apparent
// position) run through Ecliptic(). No manual vector subtraction or
// Earth-only 180 deg offset (see ZodiacRing.tsx) is needed for this one.
export function geocentricEclipticLongitudeDeg(planetName: string, date: Date): number {
  const body = Astronomy.Body[planetName as keyof typeof Astronomy.Body];
  const geoVector = Astronomy.GeoVector(body, date, true);
  return Astronomy.Ecliptic(geoVector).elon;
}

// The real Earth->planet distance in AU -- used to place a secondary marker
// along a PlanetZodiacRay at the same visually-compressed distance the rest
// of the scene uses (see auToScene in scale.ts), rather than always at the
// ring's fixed outer edge.
export function geocentricDistanceAu(planetName: string, date: Date): number {
  const body = Astronomy.Body[planetName as keyof typeof Astronomy.Body];
  return Astronomy.GeoVector(body, date, true).Length();
}

// Earth has no meaningful geocentric longitude relative to itself (the
// Earth->Earth vector is zero), so "Earth's sign" instead means what that
// phrase means colloquially and astrologically: the Sun's own apparent
// (geocentric) tropical sign -- the traditional birthday-based "sun sign,"
// which is exactly the quantity ZodiacRing's Earth-season ring (offsetDeg
// 180) is already positioned around.
export function sunEclipticLongitudeDeg(date: Date): number {
  return Astronomy.SunPosition(date).elon;
}

// Position for any selection key: a known planet name resolves to its live
// position, "Moon" tracks Earth's position plus its own geocentric offset,
// anything else (the Sun, "overview") is the origin — the Sun sits at the
// heliocentric frame's center by definition, and "overview" has no body to
// track.
export function scenePositionForKey(key: string, date: Date): [number, number, number] {
  if (key === "Moon") return moonScenePosition(date);
  const planet = PLANETS.find((p) => p.name === key);
  return planet ? heliocentricScenePosition(planet.name, date) : [0, 0, 0];
}
