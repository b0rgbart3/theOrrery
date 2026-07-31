import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import type { Fact } from "../data/facts";
import { scenePositionForKey } from "../astronomy/ephemeris";
import { useTimeStore } from "../state/timeStore";
import "./PlanetLabel.scss";

interface PlanetLabelProps {
  selectionKey: string;
  radius: number;
  name: string;
  facts: Fact[];
  onClose: () => void;
}

// A screen-space (not 3D-rotated) overlay, anchored to the body's live
// position — this is what makes it always sit on a plane parallel to the
// viewer's screen regardless of camera angle, and keeps it pinned to the
// planet as it actually moves along its orbit during playback.
export function PlanetLabel({ selectionKey, radius, name, facts, onClose }: PlanetLabelProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const simDate = useTimeStore.getState().simDate;
    const [x, y, z] = scenePositionForKey(selectionKey, simDate);
    groupRef.current.position.set(x, y + radius + 0.8, z);
  });

  return (
    <group ref={groupRef}>
      <Html center>
        <div className="planet-label">
          <button
            className="planet-label__close"
            onClick={(event) => {
              // Without this, the click bubbles up to the R3F canvas's own
              // pointer handling (the Html overlay lives inside the same
              // event-target container), which sees no 3D object under the
              // cursor and fires onPointerMissed — clearing the selection
              // and resetting the camera focus right after we close.
              event.stopPropagation();
              onClose();
            }}
            aria-label="Close"
          >
            ×
          </button>
          <h3>{name}</h3>
          <dl>
            {facts.map((fact) => (
              <div className="planet-label__row" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Html>
    </group>
  );
}
