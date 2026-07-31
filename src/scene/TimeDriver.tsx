import { useFrame } from "@react-three/fiber";
import { useTimeStore } from "../state/timeStore";

// No visual output — just ticks the shared simulation clock forward each
// frame (a no-op while paused). Everything time-dependent (planet position,
// self-rotation, camera tracking) reads useTimeStore.getState().simDate
// directly inside its own useFrame rather than subscribing reactively.
export function TimeDriver() {
  useFrame((_, delta) => {
    useTimeStore.getState().advance(delta);
  });

  return null;
}
