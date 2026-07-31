import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import { scenePositionForKey } from "../astronomy/ephemeris";
import { useTimeStore } from "../state/timeStore";
import "./PlanetNameLabel.scss";

interface PlanetNameLabelProps {
  planetName: string;
  radius: number;
}

// A screen-space overlay (not 3D-rotated) whose diagonal leader line always
// reads the same way regardless of camera angle -- anchored to the body's
// live position the same way PlanetLabel is, so it tracks orbital motion
// during playback.
export function PlanetNameLabel({ planetName, radius }: PlanetNameLabelProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const simDate = useTimeStore.getState().simDate;
    const [x, y, z] = scenePositionForKey(planetName, simDate);
    groupRef.current.position.set(x, y + radius, z);
  });

  return (
    <group ref={groupRef}>
      <Html zIndexRange={[1, 0]}>
        <div className="planet-name-label">
          <span className="planet-name-label__dot" />
          <span className="planet-name-label__line" />
          <span className="planet-name-label__text">{planetName}</span>
        </div>
      </Html>
    </group>
  );
}
