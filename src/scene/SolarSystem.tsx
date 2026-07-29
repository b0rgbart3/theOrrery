import { useMemo } from "react";
import { Vector3 } from "three";
import { Sun } from "./Sun";
import { Planet } from "./Planet";
import { OrbitPath } from "./OrbitPath";
import { CameraRig } from "./CameraRig";
import { PlanetLabel } from "./PlanetLabel";
import { PLANETS, type PlanetData } from "../data/planets";
import { auToScene, SUN_RADIUS } from "../astronomy/scale";
import { heliocentricScenePosition } from "../astronomy/ephemeris";
import { planetFacts, SUN_FACTS } from "../data/facts";
import type { Selection } from "./selection";

// Comfortably larger than the outermost orbit (Neptune) so the default,
// nothing-selected view frames the whole system rather than the tighter
// close-up distance used once a body is actually selected.
const OVERVIEW_DISTANCE = Math.max(...PLANETS.map((p) => auToScene(p.semiMajorAxisAu))) * 1.5;

function bodyViewDistance(radius: number): number {
  return Math.max(radius * 8, 6);
}

// Keeps the camera from flying through the surface of whatever it's
// orbiting — without this, minDistance was a fixed 1 unit, which is well
// inside the Sun's own radius (4), letting a full zoom-in tunnel through it.
function bodyMinDistance(radius: number): number {
  return Math.max(radius * 1.5, 0.5);
}

interface SolarSystemProps {
  selection: Selection | null;
  onSelect: (selection: Selection | null) => void;
}

export function SolarSystem({ selection, onSelect }: SolarSystemProps) {
  const now = useMemo(() => new Date(), []);

  function selectSun() {
    onSelect({ key: "sun", position: new Vector3(0, 0, 0), radius: SUN_RADIUS, name: "Sun", facts: SUN_FACTS });
  }

  function selectPlanet(planet: PlanetData, position: [number, number, number], radius: number) {
    onSelect({
      key: planet.name,
      position: new Vector3(...position),
      radius,
      name: planet.name,
      facts: planetFacts(planet),
    });
  }

  return (
    <>
      <pointLight position={[0, 0, 0]} intensity={800} decay={2} />
      <ambientLight intensity={0.1} />

      <Sun onFocus={selectSun} />

      {PLANETS.map((planet) => {
        const position = heliocentricScenePosition(planet.name, now);

        return (
          <group key={planet.name}>
            <OrbitPath planetName={planet.name} orbitalPeriodDays={planet.orbitalPeriodDays} referenceDate={now} />
            <Planet data={planet} position={position} onFocus={(pos, radius) => selectPlanet(planet, pos, radius)} />
          </group>
        );
      })}

      <CameraRig
        focusKey={selection?.key ?? "overview"}
        focusPosition={selection?.position ?? new Vector3(0, 0, 0)}
        focusDistance={selection ? bodyViewDistance(selection.radius) : OVERVIEW_DISTANCE}
        minDistance={bodyMinDistance(selection?.radius ?? SUN_RADIUS)}
      />

      {selection && (
        <PlanetLabel
          position={selection.position}
          radius={selection.radius}
          name={selection.name}
          facts={selection.facts}
          onClose={() => onSelect(null)}
        />
      )}
    </>
  );
}
