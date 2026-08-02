import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Quaternion, Vector3, type Group } from "three";
import { useTimeStore } from "../state/timeStore";
import type { OrbitVariant } from "./orbitDisplay";

const DAY_MS = 24 * 60 * 60 * 1000;
const UP = new Vector3(0, 1, 0);

// Tuned for planet-scale orbits (radius ~16-70 scene units). The Moon's orbit
// around Earth is smaller by more than an order of magnitude (~1.7 units),
// so it passes its own, much smaller values for these — otherwise the same
// absolute dash/gap/arrow sizes read as oversized chunks on its tiny loop.
const DEFAULT_SEGMENTS = 180;
const DEFAULT_ARROW_COUNT = 8;
const DEFAULT_DASH_SIZE = 0.6;
const DEFAULT_GAP_SIZE = 0.2;
const DEFAULT_ARROW_RADIUS = 0.08;
const DEFAULT_ARROW_LENGTH = 0.22;

// "regular" and "bright" match what used to be the only two looks (formerly
// labeled "Dim" and "Regular" respectively); "dim" is new, at half of
// "regular"'s weight.
const LINE_STYLE: Record<OrbitVariant, { lineWidth: number; opacity: number }> =
  {
    dim: { lineWidth: 0.1, opacity: 0.3 },
    regular: { lineWidth: 0.15, opacity: 0.5 },
    bright: { lineWidth: 0.2, opacity: 0.7 },
  };

interface OrbitPathProps {
  getPosition: (date: Date) => [number, number, number];
  orbitalPeriodDays: number;
  referenceDate: Date;
  color: string;
  variant: OrbitVariant;
  /**
   * When set, `getPosition` is sampled relative to this moving center (e.g.
   * the Moon's orbit is shaped around Earth, not the Sun) and the whole
   * ellipse is re-anchored to the center's live position every frame, so it
   * rides along as the center itself moves. Omit for Sun-relative planetary
   * orbits, where the center never moves and re-anchoring every frame would
   * be wasted work.
   */
  followCenter?: (date: Date) => [number, number, number];
  segments?: number;
  arrowCount?: number;
  dashSize?: number;
  gapSize?: number;
  arrowRadius?: number;
  arrowLength?: number;
}

// Sampled from real positions across one full orbital period (rather than a
// fixed-radius circle), so eccentric orbits like Mercury's actually read as
// eccentric, with the Sun sitting off-center at one focus of the ellipse.
// Points are in true chronological order (increasing date), so consecutive
// points already point in the real direction of travel — no extra orbital
// mechanics needed to place the directional arrows correctly.
export function OrbitPath({
  getPosition,
  orbitalPeriodDays,
  referenceDate,
  color,
  variant,
  followCenter,
  segments = DEFAULT_SEGMENTS,
  arrowCount = DEFAULT_ARROW_COUNT,
  dashSize = DEFAULT_DASH_SIZE,
  gapSize = DEFAULT_GAP_SIZE,
  arrowRadius = DEFAULT_ARROW_RADIUS,
  arrowLength = DEFAULT_ARROW_LENGTH,
}: OrbitPathProps) {
  const groupRef = useRef<Group>(null);

  const points = useMemo(() => {
    const startMs = referenceDate.getTime();
    const periodMs = orbitalPeriodDays * DAY_MS;
    return Array.from({ length: segments + 1 }, (_, i) => {
      const date = new Date(startMs + (i / segments) * periodMs);
      return new Vector3(...getPosition(date));
    });
  }, [getPosition, orbitalPeriodDays, referenceDate, segments]);

  const arrows = useMemo(() => {
    return Array.from({ length: arrowCount }, (_, i) => {
      const index = Math.floor((i / arrowCount) * segments);
      const current = points[index];
      const next = points[(index + 1) % points.length];
      const tangent = next.clone().sub(current).normalize();
      return {
        position: current,
        quaternion: new Quaternion().setFromUnitVectors(UP, tangent),
      };
    });
  }, [points, arrowCount, segments]);

  // A chevron ("^") drawn as two thin line segments rather than a filled
  // shape — the tip points along +Y to match the old cone's orientation
  // convention, so the tangent-alignment quaternion above still applies
  // unchanged.
  const chevronPoints = useMemo(() => {
    const halfWidth = arrowRadius;
    const halfLength = arrowLength / 2;
    return [
      new Vector3(-halfWidth, -halfLength, 0),
      new Vector3(0, halfLength, 0),
      new Vector3(halfWidth, -halfLength, 0),
    ];
  }, [arrowRadius, arrowLength]);

  useFrame(() => {
    if (!followCenter || !groupRef.current) return;
    const simDate = useTimeStore.getState().simDate;
    groupRef.current.position.set(...followCenter(simDate));
  });

  const { lineWidth, opacity } = LINE_STYLE[variant];

  return (
    <group ref={groupRef}>
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
        dashed
        dashSize={dashSize}
        gapSize={gapSize}
      />
      {arrows.map((arrow, i) => (
        <Line
          key={i}
          points={chevronPoints}
          position={arrow.position}
          quaternion={arrow.quaternion}
          color={color}
          lineWidth={lineWidth}
          transparent
          opacity={opacity}
        />
      ))}
    </group>
  );
}
