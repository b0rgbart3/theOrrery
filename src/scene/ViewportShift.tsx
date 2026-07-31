import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

// Whatever's focused always lands at dead screen-center, since OrbitControls
// keeps the camera looking straight at its target. This nudges the
// projection (not the camera position/target) so the model sits around 45%
// down the page instead of 50% — a pure off-axis shift, so it doesn't fight
// with CameraRig's target-tracking logic or distort click-to-select
// raycasting.
const VERTICAL_SHIFT = 0.05;

export function ViewportShift() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);

  useEffect(() => {
    camera.setViewOffset(width, height, 0, height * VERTICAL_SHIFT, width, height);
    return () => camera.clearViewOffset();
  }, [camera, width, height]);

  return null;
}
