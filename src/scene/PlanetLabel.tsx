import { Html } from "@react-three/drei";
import type { Vector3 } from "three";
import type { Fact } from "../data/facts";
import "./PlanetLabel.scss";

interface PlanetLabelProps {
  position: Vector3;
  radius: number;
  name: string;
  facts: Fact[];
  onClose: () => void;
}

// A screen-space (not 3D-rotated) overlay, anchored to the body's position —
// this is what makes it always sit on a plane parallel to the viewer's
// screen regardless of camera angle, rather than tilting with the scene.
export function PlanetLabel({ position, radius, name, facts, onClose }: PlanetLabelProps) {
  return (
    <Html position={[position.x, position.y + radius + 0.8, position.z]} center>
      <div className="planet-label">
        <button className="planet-label__close" onClick={onClose} aria-label="Close">
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
  );
}
