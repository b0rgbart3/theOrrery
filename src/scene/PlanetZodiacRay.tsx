import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CylinderGeometry, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";
import { useTimeStore } from "../state/timeStore";
import {
  geocentricEclipticLongitudeDeg,
  geocentricDistanceAu,
  heliocentricScenePosition,
} from "../astronomy/ephemeris";
import { SUN_RADIUS, auToScene } from "../astronomy/scale";
import { PLANETS } from "../data/planets";

// Same outer radius as the true ZodiacRing this is drawn alongside (Neptune's
// orbit, one solar radius below whatever it's centered on).
const RING_OUTER_RADIUS = auToScene(PLANETS[PLANETS.length - 1].semiMajorAxisAu);
const RING_Y = -SUN_RADIUS;

const LINE_RADIUS = 0.06;
// Large and equal-weight on purpose: the start/end dots anchor the ray's two
// meaningful endpoints (Earth and the sign it crosses), and the distance dot
// is where the connector attaches -- not an incidental point, so it reads
// with the same visual weight as the other two, not as a minor detail.
const DOT_RADIUS = LINE_RADIUS * 5;
// At least as thick as the main ray -- a thinner/dimmer connector read as a
// secondary, optional detail, undercutting that the planet's mesh and the
// ray are showing a real, direct relationship.
const CONNECTOR_RADIUS = LINE_RADIUS * 1.25;
const CYLINDER_SEGMENTS = 8;
const DOT_SEGMENTS = 12;

const UP = new Vector3(0, 1, 0);

// Orients and scales a unit cylinder (built along local +Y, height 1) to
// span exactly from `start` to `end`.
function stretchBetween(mesh: Mesh, start: Vector3, end: Vector3) {
  const segment = end.clone().sub(start);
  const length = segment.length();
  mesh.position.copy(start).addScaledVector(segment, 0.5);
  if (length > 0) mesh.quaternion.setFromUnitVectors(UP, segment.normalize());
  mesh.scale.set(1, length, 1);
}

interface PlanetZodiacRayProps {
  planetName: string;
  color?: string;
}

// A straight line from Earth through `planetName`, extended to the true
// zodiac ring's outer edge -- the wedge it crosses there is `planetName`'s
// real (geocentric) sign, matching the number shown in its label exactly,
// by construction: the direction is computed from the exact same
// geocentricEclipticLongitudeDeg() call the label uses, not re-derived from
// scene positions (see git history for why that used to be wrong: scene
// positions use auToScene's nonlinear per-body distance compression, and
// subtracting two differently-compressed positions corrupts the angle).
//
// A second dot -- same size and material as the ray's own endpoints, not a
// lesser/incidental detail -- marks the planet's true distance along this
// same ray: its real Earth-to-planet distance run through the same
// auToScene compression the rest of the scene uses, rather than always
// sitting at the ring's fixed edge. That distance dot generally does NOT
// coincide with the planet's own mesh (which sits at its
// heliocentric-compressed position, a different compression basis --
// distance from the Sun, not from Earth), so a connector (at least as thick
// as the ray itself) links the two directly, the same dot+leader-line idiom
// PlanetNameLabel uses to anchor a floating label to a moving body.
//
// This component is meant to be rendered as a child of a <FollowBody>
// centered on Earth (see SolarSystem.tsx): Earth is the local origin, so
// the ray simply runs from there out to radius R in the computed direction.
export function PlanetZodiacRay({ planetName, color = "white" }: PlanetZodiacRayProps) {
  const material = useMemo(() => new MeshBasicMaterial({ transparent: true, opacity: 0.9 }), []);
  useMemo(() => {
    material.color.set(color);
  }, [material, color]);

  const cylinderGeometry = useMemo(
    () => new CylinderGeometry(LINE_RADIUS, LINE_RADIUS, 1, CYLINDER_SEGMENTS),
    [],
  );
  const connectorGeometry = useMemo(
    () => new CylinderGeometry(CONNECTOR_RADIUS, CONNECTOR_RADIUS, 1, CYLINDER_SEGMENTS),
    [],
  );
  const dotGeometry = useMemo(() => new SphereGeometry(DOT_RADIUS, DOT_SEGMENTS, DOT_SEGMENTS), []);

  const line = useMemo(() => {
    const mesh = new Mesh(cylinderGeometry, material);
    mesh.raycast = () => {};
    return mesh;
  }, [cylinderGeometry, material]);

  const startDot = useMemo(() => {
    const mesh = new Mesh(dotGeometry, material);
    mesh.raycast = () => {};
    return mesh;
  }, [dotGeometry, material]);

  const endDot = useMemo(() => {
    const mesh = new Mesh(dotGeometry, material);
    mesh.raycast = () => {};
    return mesh;
  }, [dotGeometry, material]);

  const distanceDot = useMemo(() => {
    const mesh = new Mesh(dotGeometry, material);
    mesh.raycast = () => {};
    return mesh;
  }, [dotGeometry, material]);

  const connector = useMemo(() => {
    const mesh = new Mesh(connectorGeometry, material);
    mesh.raycast = () => {};
    return mesh;
  }, [connectorGeometry, material]);

  useFrame(() => {
    const simDate = useTimeStore.getState().simDate;
    const lonRad = (geocentricEclipticLongitudeDeg(planetName, simDate) * Math.PI) / 180;
    // Matches the ring's own local-angle convention (offsetDeg=0 -- see
    // ZodiacRing.tsx): sceneX = R*cos(angle), sceneZ = -R*sin(angle).
    const ux = Math.cos(lonRad);
    const uz = -Math.sin(lonRad);

    // Local to the Earth-centered parent group: start is the local origin,
    // end is exactly radius R away in the planet's direction.
    const start = new Vector3(0, RING_Y, 0);
    const end = new Vector3(ux * RING_OUTER_RADIUS, RING_Y, uz * RING_OUTER_RADIUS);
    stretchBetween(line, start, end);
    startDot.position.copy(start);
    endDot.position.copy(end);

    const distanceAu = geocentricDistanceAu(planetName, simDate);
    const visualDistance = auToScene(distanceAu);
    const distancePoint = new Vector3(ux * visualDistance, RING_Y, uz * visualDistance);
    distanceDot.position.copy(distancePoint);

    const [ex, ey, ez] = heliocentricScenePosition("Earth", simDate);
    const [px, py, pz] = heliocentricScenePosition(planetName, simDate);
    const planetLocal = new Vector3(px - ex, py - ey, pz - ez);
    stretchBetween(connector, distancePoint, planetLocal);
  });

  return (
    <>
      <primitive object={line} />
      <primitive object={startDot} />
      <primitive object={endDot} />
      <primitive object={distanceDot} />
      <primitive object={connector} />
    </>
  );
}
