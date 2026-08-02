import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Line, useTexture } from "@react-three/drei";
import type { Group } from "three";
import { moonRadiusToScene } from "../astronomy/scale";
import { moonScenePosition, moonOrientationQuaternion } from "../astronomy/ephemeris";
import { useTimeStore } from "../state/timeStore";
import { MOON } from "../data/moon";

interface MoonProps {
  onFocus: (radius: number) => void;
  showAxisLine: boolean;
}

export function Moon({ onFocus, showAxisLine }: MoonProps) {
  const groupRef = useRef<Group>(null);
  const orientationRef = useRef<Group>(null);
  const texture = useTexture(MOON.texture);
  const radius = moonRadiusToScene(MOON.radiusKm);

  useFrame(() => {
    const simDate = useTimeStore.getState().simDate;

    if (groupRef.current) {
      const [x, y, z] = moonScenePosition(simDate);
      groupRef.current.position.set(x, y, z);
    }

    if (orientationRef.current) {
      // Real IAU/lunar-theory orientation (not a spin-phase approximation),
      // so the same hemisphere keeps facing Earth — including physical
      // libration — at any simulated date, whether playing, scrubbing, or
      // paused.
      orientationRef.current.quaternion.copy(moonOrientationQuaternion(simDate));
    }
  });

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onFocus(radius);
  }

  return (
    <group ref={groupRef}>
      <group ref={orientationRef}>
        <mesh onClick={handleClick}>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshStandardMaterial map={texture} roughness={1} />
        </mesh>
        {showAxisLine && (
          <Line
            points={[
              [0, radius * 1.4, 0],
              [0, -radius * 1.4, 0],
            ]}
            color="gray"
            transparent
            opacity={0.6}
            lineWidth={1}
          />
        )}
      </group>
    </group>
  );
}
