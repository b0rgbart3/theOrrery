import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Quaternion, Vector3, type Group } from "three";
import { useTimeStore } from "../state/timeStore";
import type { OrbitVariant } from "./orbitDisplay";

const SEGMENTS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;
const ARROW_COUNT = 8;
const UP = new Vector3(0, 1, 0);

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
}: OrbitPathProps) {
  const groupRef = useRef<Group>(null);

  const points = useMemo(() => {
    const startMs = referenceDate.getTime();
    const periodMs = orbitalPeriodDays * DAY_MS;
    return Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const date = new Date(startMs + (i / SEGMENTS) * periodMs);
      return new Vector3(...getPosition(date));
    });
  }, [getPosition, orbitalPeriodDays, referenceDate]);

  const arrows = useMemo(() => {
    return Array.from({ length: ARROW_COUNT }, (_, i) => {
      const index = Math.floor((i / ARROW_COUNT) * SEGMENTS);
      const current = points[index];
      const next = points[(index + 1) % points.length];
      const tangent = next.clone().sub(current).normalize();
      return {
        position: current,
        quaternion: new Quaternion().setFromUnitVectors(UP, tangent),
      };
    });
  }, [points]);

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
        dashSize={0.6}
        gapSize={0.2}
      />
      {arrows.map((arrow, i) => (
        <mesh key={i} position={arrow.position} quaternion={arrow.quaternion}>
          <coneGeometry args={[0.08, 0.22, 3]} />
          <meshBasicMaterial color={color} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}
