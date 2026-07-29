import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import { heliocentricScenePosition } from "../astronomy/ephemeris";

const SEGMENTS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

interface OrbitPathProps {
  planetName: string;
  orbitalPeriodDays: number;
  referenceDate: Date;
}

// Sampled from real positions across one full orbital period (rather than a
// fixed-radius circle), so eccentric orbits like Mercury's actually read as
// eccentric, with the Sun sitting off-center at one focus of the ellipse.
export function OrbitPath({ planetName, orbitalPeriodDays, referenceDate }: OrbitPathProps) {
  const points = useMemo(() => {
    const startMs = referenceDate.getTime();
    const periodMs = orbitalPeriodDays * DAY_MS;
    return Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const date = new Date(startMs + (i / SEGMENTS) * periodMs);
      return new Vector3(...heliocentricScenePosition(planetName, date));
    });
  }, [planetName, orbitalPeriodDays, referenceDate]);

  return <Line points={points} color="#3a4a5c" lineWidth={1} transparent opacity={0.5} />;
}
