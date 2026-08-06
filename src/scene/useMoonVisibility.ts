import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { heliocentricScenePosition } from "../astronomy/ephemeris";
import { useTimeStore } from "../state/timeStore";

// Shown only once the camera is zoomed in close enough to Earth for the
// Moon's ~1 scene-unit orbit to read as separate from Earth itself --
// otherwise (system overview, or examining another planet) Earth's and the
// Moon's markers/labels sit on top of each other as unreadable clutter.
// Measured as distance to Earth specifically (not overall camera zoom), so
// this tracks "are we looking at Earth" rather than "how zoomed in is the
// whole scene."
//
// SHOW_DISTANCE sits comfortably above Earth's own focus distance (6 scene
// units, from bodyViewDistance in SolarSystem.tsx) so selecting Earth always
// reveals the Moon. HIDE_DISTANCE is offset from SHOW_DISTANCE (hysteresis)
// so the camera's damped zoom motion can't flicker the Moon in and out right
// at one exact boundary value.
const SHOW_DISTANCE = 22;
const HIDE_DISTANCE = 24;

export function useMoonVisibility(): boolean {
  const { camera } = useThree();
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(visible);

  useFrame(() => {
    const simDate = useTimeStore.getState().simDate;
    const earthPosition = new Vector3(...heliocentricScenePosition("Earth", simDate));
    const distance = camera.position.distanceTo(earthPosition);

    if (visibleRef.current && distance > HIDE_DISTANCE) {
      visibleRef.current = false;
      setVisible(false);
    } else if (!visibleRef.current && distance < SHOW_DISTANCE) {
      visibleRef.current = true;
      setVisible(true);
    }
  });

  return visible;
}
