import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { Mesh } from "three";
import { radiusKmToScene } from "../astronomy/scale";
import type { PlanetData } from "../data/planets";
import { PlanetRing } from "./PlanetRing";

interface PlanetProps {
  data: PlanetData;
  position: [number, number, number];
  onFocus: (position: [number, number, number], radius: number) => void;
}

export function Planet({ data, position, onFocus }: PlanetProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(data.texture);
  const radius = radiusKmToScene(data.radiusKm);
  const tiltRad = (data.axialTiltDeg * Math.PI) / 180;

  useFrame(() => {
    if (meshRef.current) {
      // Computed fresh from absolute real time each frame (not accumulated
      // via delta) so it can't drift and self-corrects even after the tab
      // was backgrounded — it always reflects the planet's true current
      // rotational phase, not an arbitrary spin rate.
      const hoursSinceEpoch = Date.now() / 3_600_000;
      const phase = (hoursSinceEpoch / data.rotationPeriodHours) % 1;
      meshRef.current.rotation.y = phase * Math.PI * 2;
    }
  });

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onFocus(position, radius);
  }

  return (
    <group position={position} rotation={[0, 0, tiltRad]}>
      <mesh ref={meshRef} onClick={handleClick}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial map={texture} roughness={1} />
      </mesh>
      {data.ring && (
        <PlanetRing
          innerRadius={radius * data.ring.innerRadiusFactor}
          outerRadius={radius * data.ring.outerRadiusFactor}
          texture={data.ring.texture}
        />
      )}
    </group>
  );
}
