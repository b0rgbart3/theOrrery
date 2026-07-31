import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3, MathUtils } from "three";
import { scenePositionForKey } from "../astronomy/ephemeris";
import { useTimeStore } from "../state/timeStore";

interface CameraRigProps {
  focusKey: string;
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
//
// Position is derived from focusKey + the live simulation clock every frame
// (not a position snapshotted at click time), so a selected planet keeps
// being tracked correctly as it actually moves along its orbit during
// playback — the steady-state (non-transitioning) branch below shifts the
// camera by the same delta as the target so the user's chosen zoom/angle is
// preserved while following the motion.
export function CameraRig({
  focusKey,
  focusDistance,
  minDistance,
}: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const transitioning = useRef(true);
  const targetDistance = useRef(focusDistance);

  useEffect(() => {
    targetDistance.current = focusDistance;
    transitioning.current = true;
  }, [focusKey, focusDistance]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const simDate = useTimeStore.getState().simDate;
    const livePosition = new Vector3(...scenePositionForKey(focusKey, simDate));
    const target = controls.target as Vector3;

    if (transitioning.current) {
      const t = Math.min(1, delta * LERP_SPEED);
      const offsetDirection = camera.position.clone().sub(target).normalize();
      const currentDistance = camera.position.distanceTo(target);

      target.lerp(livePosition, t);
      const nextDistance = MathUtils.lerp(
        currentDistance,
        targetDistance.current,
        t,
      );
      camera.position
        .copy(target)
        .addScaledVector(offsetDirection, nextDistance);

      const reachedTarget = target.distanceTo(livePosition) < TARGET_EPSILON;
      const reachedDistance =
        Math.abs(nextDistance - targetDistance.current) < DISTANCE_EPSILON;
      if (reachedTarget && reachedDistance) {
        transitioning.current = false;
      }
    } else {
      const followDelta = livePosition.clone().sub(target);
      if (followDelta.lengthSq() > 1e-10) {
        target.add(followDelta);
        camera.position.add(followDelta);
      }
    }

    // Don't call controls.update() here — drei's <OrbitControls> already calls
    // it once per frame internally. Calling it a second time double-processes
    // its internal zoom/damping state each frame, which only became visible
    // once the steady-state branch above started actively mutating the
    // camera every frame (to follow a moving selected planet during
    // playback) — hence bouncing that only showed up while playing.
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={minDistance}
      zoomSpeed={0.5}
      maxDistance={250}
    />
  );
}
