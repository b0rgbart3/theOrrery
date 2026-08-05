import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { AdditiveBlending, BackSide, Color, type Mesh } from "three";
import { SUN_RADIUS } from "../astronomy/scale";
import { useTimeStore } from "../state/timeStore";

// Sidereal rotation period at the Sun's equator (it rotates faster at the
// equator than near the poles, but a single rate is enough for this model).
const SUN_ROTATION_PERIOD_HOURS = 609.12;

// A fixed fraction of the Sun's own radius (a scene-space size, not screen
// pixels), so the glow scales down with the Sun when you zoom out and stays
// a thin rim rather than reading as a fat halo relative to the disk.
const GLOW_THICKNESS_RATIO = 0.084;
const GLOW_SCALE = (SUN_RADIUS + SUN_RADIUS * GLOW_THICKNESS_RATIO) / SUN_RADIUS;
const GLOW_COLOR = new Color("#ffcc77");

const glowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const glowFragmentShader = `
  uniform vec3 glowColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    // Per-fragment view direction (not a fixed camera-forward axis), so the
    // rim stays spherically symmetric even when the Sun is off-center /
    // viewed at an angle, e.g. while the camera is focused on a planet.
    vec3 viewDir = normalize(vViewPosition);
    float facing = 0.65 - dot(vNormal, viewDir);
    // smoothstep (rather than a steep power curve) fades all the way to 0 at
    // the outer edge and eases in gradually, instead of jumping straight to
    // a hard, mostly-opaque ring.
    float rim = smoothstep(0.65, 1.3, facing);
    gl_FragColor = vec4(glowColor, rim * 0.6);
  }
`;

interface SunProps {
  onFocus: () => void;
}

export function Sun({ onFocus }: SunProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture("/textures/sun.jpg");

  const glowUniforms = useMemo(() => ({ glowColor: { value: GLOW_COLOR } }), []);

  useFrame(() => {
    if (meshRef.current) {
      const simHours = useTimeStore.getState().simDate.getTime() / 3_600_000;
      const phase = (simHours / SUN_ROTATION_PERIOD_HOURS) % 1;
      meshRef.current.rotation.y = phase * Math.PI * 2;
    }
  });

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    onFocus();
  }

  return (
    <group>
      <mesh ref={meshRef} onClick={handleClick}>
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <mesh scale={GLOW_SCALE} raycast={() => null}>
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        <shaderMaterial
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={glowUniforms}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          side={BackSide}
        />
      </mesh>
    </group>
  );
}
