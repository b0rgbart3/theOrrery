import { useEffect, useMemo, useState } from "react";
import { Sun } from "./Sun";
import { Planet } from "./Planet";
import { OrbitPath } from "./OrbitPath";
import { CameraRig } from "./CameraRig";
import { PlanetLabel } from "./PlanetLabel";
import { TimeDriver } from "./TimeDriver";
import { PLANETS, type PlanetData } from "../data/planets";
import { auToScene, SUN_RADIUS } from "../astronomy/scale";
import { planetFacts, SUN_FACTS } from "../data/facts";
import { useTimeStore } from "../state/timeStore";
import type { Selection } from "./selection";
import type { OrbitDisplayMode, OrbitVariant } from "./orbitDisplay";

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
  orbitMode: OrbitDisplayMode;
}

export function SolarSystem({ selection, onSelect, orbitMode }: SolarSystemProps) {
  // A fixed anchor purely for sampling each orbit's elliptical shape (orbital
  // elements barely change on human timescales) — NOT the moving simulation
  // clock, so orbit-path geometry isn't recomputed every frame.
  const orbitShapeReferenceDate = useMemo(() => new Date(), []);

  // The tooltip's facts are static, but its screen anchor tracks the body's
  // live position — while playing or actively scrubbing that anchor is
  // constantly moving, which reads as jittery, so hide it until time is
  // holding still.
  const isPlaying = useTimeStore((s) => s.isPlaying);
  const isScrubbing = useTimeStore((s) => s.isScrubbing);

  // Closing the tooltip shouldn't drop the camera focus, so its visibility
  // is tracked separately from the selection itself — dismissed here,
  // brought back whenever a (possibly new) body is selected.
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  useEffect(() => {
    setTooltipDismissed(false);
  }, [selection?.key]);

  const showTooltip = selection !== null && !isPlaying && !isScrubbing && !tooltipDismissed;

  function selectSun() {
    onSelect({ key: "sun", radius: SUN_RADIUS, name: "Sun", facts: SUN_FACTS });
  }

  function selectPlanet(planet: PlanetData, radius: number) {
    onSelect({ key: planet.name, radius, name: planet.name, facts: planetFacts(planet) });
  }

  return (
    <>
      <TimeDriver />

      <pointLight position={[0, 0, 0]} intensity={800} decay={2} />
      <ambientLight intensity={0.1} />

      <Sun onFocus={selectSun} />

      {PLANETS.map((planet) => {
        const isSelected = selection?.key === planet.name;
        const showOrbit = orbitMode !== "hidden";
        const variant: OrbitVariant =
          orbitMode === "selected" ? (isSelected ? "bright" : "regular") : (orbitMode as OrbitVariant);

        return (
          <group key={planet.name}>
            {showOrbit && (
              <OrbitPath
                planetName={planet.name}
                orbitalPeriodDays={planet.orbitalPeriodDays}
                referenceDate={orbitShapeReferenceDate}
                color={planet.color}
                variant={variant}
              />
            )}
            <Planet data={planet} onFocus={(radius) => selectPlanet(planet, radius)} />
          </group>
        );
      })}

      <CameraRig
        focusKey={selection?.key ?? "overview"}
        focusDistance={selection ? bodyViewDistance(selection.radius) : OVERVIEW_DISTANCE}
        minDistance={bodyMinDistance(selection?.radius ?? SUN_RADIUS)}
      />

      {showTooltip && selection && (
        <PlanetLabel
          selectionKey={selection.key}
          radius={selection.radius}
          name={selection.name}
          facts={selection.facts}
          onClose={() => setTooltipDismissed(true)}
        />
      )}
    </>
  );
}
