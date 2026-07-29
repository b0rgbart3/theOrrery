import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { Mesh } from "three";
import { SUN_RADIUS } from "../astronomy/scale";

// Sidereal rotation period at the Sun's equator (it rotates faster at the
// equator than near the poles, but a single rate is enough for this model).
const SUN_ROTATION_PERIOD_HOURS = 609.12;

interface SunProps {
  onFocus: () => void;
}

export function Sun({ onFocus }: SunProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture("/textures/sun.jpg");

  useFrame(() => {
    if (meshRef.current) {
      const hoursSinceEpoch = Date.now() / 3_600_000;
      const phase = (hoursSinceEpoch / SUN_ROTATION_PERIOD_HOURS) % 1;
      meshRef.current.rotation.y = phase * Math.PI * 2;
    }
  });

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onFocus();
  }

  return (
    <mesh ref={meshRef} onClick={handleClick}>
      <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
