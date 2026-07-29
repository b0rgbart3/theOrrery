import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3, MathUtils } from "three";

interface CameraRigProps {
  focusKey: string;
  focusPosition: Vector3;
  focusDistance: number;
  minDistance: number;
}

const LERP_SPEED = 2.5;
const TARGET_EPSILON = 0.05;
const DISTANCE_EPSILON = 0.05;

// Tweens the camera toward a focused body once, when the selection changes,
// then gets out of the way entirely. It must NOT keep nudging the camera
// every frame once settled — that fight is what caused zoom to "bounce":
// OrbitControls would let the user zoom in/out, and on the very next frame
// this rig used to pull the distance back toward a fixed target, which was
// only visible/jarring once the user hit the min/max zoom clamp and stopped
// fighting it with more scroll input.
export function CameraRig({ focusKey, focusPosition, focusDistance, minDistance }: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const transitioning = useRef(true);
  const targetFocusPosition = useRef(focusPosition.clone());
  const targetDistance = useRef(focusDistance);

  useEffect(() => {
    targetFocusPosition.current = focusPosition.clone();
    targetDistance.current = focusDistance;
    transitioning.current = true;
    // Only the identity of the selection should restart a transition, not
    // the Vector3 identity (a fresh instance is created on every selection).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || !transitioning.current) return;

    const t = Math.min(1, delta * LERP_SPEED);
    const target = controls.target as Vector3;
    const offsetDirection = camera.position.clone().sub(target).normalize();
    const currentDistance = camera.position.distanceTo(target);

    target.lerp(targetFocusPosition.current, t);
    const nextDistance = MathUtils.lerp(currentDistance, targetDistance.current, t);
    camera.position.copy(target).addScaledVector(offsetDirection, nextDistance);
    controls.update();

    const reachedTarget = target.distanceTo(targetFocusPosition.current) < TARGET_EPSILON;
    const reachedDistance = Math.abs(nextDistance - targetDistance.current) < DISTANCE_EPSILON;
    if (reachedTarget && reachedDistance) {
      transitioning.current = false;
    }
  });

  return (
    <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} minDistance={minDistance} maxDistance={250} />
  );
}
