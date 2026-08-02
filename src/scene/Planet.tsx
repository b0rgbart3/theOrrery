import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Line, useTexture } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { radiusKmToScene } from "../astronomy/scale";
import { heliocentricScenePosition } from "../astronomy/ephemeris";
import { useTimeStore } from "../state/timeStore";
import type { PlanetData } from "../data/planets";
import { PlanetRing } from "./PlanetRing";

interface PlanetProps {
  data: PlanetData;
  onFocus: (radius: number) => void;
  showAxisLine: boolean;
}

export function Planet({ data, onFocus, showAxisLine }: PlanetProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const texture = useTexture(data.texture);
  const atmosphereTexture = useTexture(data.atmosphere?.texture ?? data.texture);
  const radius = radiusKmToScene(data.radiusKm);
  const tiltRad = (data.axialTiltDeg * Math.PI) / 180;

  useFrame(() => {
    const simDate = useTimeStore.getState().simDate;

    if (groupRef.current) {
      const [x, y, z] = heliocentricScenePosition(data.name, simDate);
      groupRef.current.position.set(x, y, z);
    }

    // Driven by the same simulation clock as orbital position (not real
    // wall-clock time), so speeding up/scrubbing the timeline speeds up or
    // reverses self-rotation right along with orbital motion.
    const simHours = simDate.getTime() / 3_600_000;
    const phase = (simHours / data.rotationPeriodHours) % 1;
    const rotationY = phase * Math.PI * 2;

    if (meshRef.current) {
      meshRef.current.rotation.y = rotationY;
    }

    // The atmosphere shares the surface mesh's rotation so its weather
    // pattern stays locked to the same rotation phase (and, via the shared
    // parent group, the same orbital position) as the planet underneath.
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = rotationY;
    }
  });

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onFocus(radius);
  }

  return (
    <group ref={groupRef}>
      <group rotation={[0, 0, tiltRad]}>
        <mesh ref={meshRef} onClick={handleClick}>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshStandardMaterial map={texture} roughness={1} />
        </mesh>
        {data.atmosphere && (
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[radius * data.atmosphere.scaleFactor, 48, 48]} />
            <meshStandardMaterial
              map={atmosphereTexture}
              transparent
              opacity={data.atmosphere.opacity}
              depthWrite={false}
              roughness={1}
            />
          </mesh>
        )}
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
        {data.ring && (
          <PlanetRing
            innerRadius={radius * data.ring.innerRadiusFactor}
            outerRadius={radius * data.ring.outerRadiusFactor}
            texture={data.ring.texture}
          />
        )}
      </group>
    </group>
  );
}
