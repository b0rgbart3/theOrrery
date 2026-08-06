import { useMemo, useState } from "react";
import { Sun } from "./Sun";
import { Planet } from "./Planet";
import { Moon } from "./Moon";
import { OrbitPath } from "./OrbitPath";
import { ZodiacRing } from "./ZodiacRing";
import { PlanetZodiacRay } from "./PlanetZodiacRay";
import { CameraRig } from "./CameraRig";
import { PlanetLabel } from "./PlanetLabel";
import { PlanetNameLabel } from "./PlanetNameLabel";
import { TimeDriver } from "./TimeDriver";
import { useMoonVisibility } from "./useMoonVisibility";
import { FollowBody } from "./FollowBody";
import { PLANETS, type PlanetData } from "../data/planets";
import { MOON } from "../data/moon";
import { auToScene, radiusKmToScene, moonRadiusToScene, SUN_RADIUS } from "../astronomy/scale";
import { heliocentricScenePosition, moonSceneOffsetFromEarth } from "../astronomy/ephemeris";
import { planetFacts, SUN_FACTS, MOON_FACTS } from "../data/facts";
import { useTimeStore } from "../state/timeStore";
import type { Selection } from "./selection";
import type { OrbitDisplayMode, OrbitVariant } from "./orbitDisplay";
import type { ZodiacImageStyle } from "./zodiacDisplay";

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
  showAxisLine: boolean;
  showPlanetLabels: boolean;
  showZodiac: boolean;
  showPlanetaryZodiac: boolean;
  planetaryZodiacPlanets: string[];
  showZodiacRainbow: boolean;
  zodiacImageStyle: ZodiacImageStyle;
}

export function SolarSystem({
  selection,
  onSelect,
  orbitMode,
  showAxisLine,
  showPlanetLabels,
  showZodiac,
  showPlanetaryZodiac,
  planetaryZodiacPlanets,
  showZodiacRainbow,
  zodiacImageStyle,
}: SolarSystemProps) {
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
  // is tracked separately from the selection itself — dismissed on close,
  // brought back whenever a body is (re-)selected, including re-clicking
  // the already-selected body, which is how the tooltip toggles back on.
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  const moonVisible = useMoonVisibility();

  // If the Moon was selected while zoomed in and the user then scrolls back
  // out past the hide threshold, its tooltip would otherwise keep floating
  // with no visible body to anchor to.
  const showTooltip =
    selection !== null &&
    !isPlaying &&
    !isScrubbing &&
    !tooltipDismissed &&
    (selection.key !== "Moon" || moonVisible);

  // Clicking the already-selected body toggles its tooltip off (and a
  // repeat click brings it back) instead of just re-showing it — this is
  // the "click a planet to open/close its tooltip" behavior, distinct from
  // the tooltip's own close button which always dismisses.
  function selectSun() {
    if (selection?.key === "sun") {
      setTooltipDismissed((dismissed) => !dismissed);
      return;
    }
    setTooltipDismissed(false);
    onSelect({ key: "sun", radius: SUN_RADIUS, name: "Sun", facts: SUN_FACTS });
  }

  function selectPlanet(planet: PlanetData, radius: number) {
    if (selection?.key === planet.name) {
      setTooltipDismissed((dismissed) => !dismissed);
      return;
    }
    setTooltipDismissed(false);
    onSelect({ key: planet.name, radius, name: planet.name, facts: planetFacts(planet) });
  }

  function selectMoon(radius: number) {
    if (selection?.key === "Moon") {
      setTooltipDismissed((dismissed) => !dismissed);
      return;
    }
    setTooltipDismissed(false);
    onSelect({ key: "Moon", radius, name: "Moon", facts: MOON_FACTS });
  }

  const showOrbit = orbitMode !== "hidden";
  // Only the rainbow wedges are busy enough to wash out the normal thin,
  // colored, dashed orbit lines -- with just the artwork ring (rainbow off),
  // orbits stay legible in their regular per-planet color/style, so forcing
  // them white is reserved for when the wedges are actually on screen.
  const emphasizeOrbits = (showZodiac || showPlanetaryZodiac) && showZodiacRainbow;
  const isMoonSelected = selection?.key === "Moon";
  const moonOrbitVariant: OrbitVariant =
    orbitMode === "selected" ? (isMoonSelected ? "xbright" : "dim") : (orbitMode as OrbitVariant);

  return (
    <>
      <TimeDriver />

      <pointLight position={[0, 0, 0]} intensity={800} decay={2} />
      <ambientLight intensity={0.1} />

      <Sun onFocus={selectSun} />
      {showZodiac && !showPlanetaryZodiac && (
        <ZodiacRing
          offsetDeg={180}
          showRainbow={showZodiacRainbow}
          imageStyle={zodiacImageStyle}
        />
      )}
      {showPlanetaryZodiac && (
        // Centered on Earth (not the Sun) so a ray from Earth crosses this
        // ring at exactly its own true direction -- see PlanetZodiacRay.tsx.
        <FollowBody getPosition={(date) => heliocentricScenePosition("Earth", date)}>
          <ZodiacRing
            offsetDeg={0}
            showRainbow={showZodiacRainbow}
            imageStyle={zodiacImageStyle}
          />
          {planetaryZodiacPlanets.map((planetName) => {
            const planet = PLANETS.find((p) => p.name === planetName);
            return planet ? (
              <PlanetZodiacRay key={planetName} planetName={planetName} color={planet.color} />
            ) : null;
          })}
        </FollowBody>
      )}

      {PLANETS.map((planet) => {
        const isSelected = selection?.key === planet.name;
        const variant: OrbitVariant =
          orbitMode === "selected" ? (isSelected ? "xbright" : "dim") : (orbitMode as OrbitVariant);

        return (
          <group key={planet.name}>
            {showOrbit && (
              <OrbitPath
                getPosition={(date) => heliocentricScenePosition(planet.name, date)}
                orbitalPeriodDays={planet.orbitalPeriodDays}
                referenceDate={orbitShapeReferenceDate}
                color={planet.color}
                variant={variant}
                emphasized={emphasizeOrbits}
              />
            )}
            <Planet
              data={planet}
              onFocus={(radius) => selectPlanet(planet, radius)}
              showAxisLine={showAxisLine}
            />
            {showPlanetLabels && (
              <PlanetNameLabel
                planetName={planet.name}
                radius={radiusKmToScene(planet.radiusKm)}
                showZodiacSign={showZodiac || showPlanetaryZodiac}
              />
            )}
          </group>
        );
      })}

      <group>
        {showOrbit && moonVisible && (
          <OrbitPath
            getPosition={moonSceneOffsetFromEarth}
            followCenter={(date) => heliocentricScenePosition("Earth", date)}
            orbitalPeriodDays={MOON.orbitalPeriodDays}
            referenceDate={orbitShapeReferenceDate}
            color={MOON.color}
            variant={moonOrbitVariant}
            emphasized={emphasizeOrbits}
            // The Moon's orbit (~1.7 scene units) is over an order of
            // magnitude smaller than any planet's — the default dash/arrow
            // sizes (tuned for orbits 16-70 units across) would read as
            // oversized chunks here, so it gets its own, much smaller scale
            // plus more segments/arrows so the tiny loop still reads smoothly.
            segments={240}
            arrowCount={12}
            dashSize={0.05}
            gapSize={0.02}
            arrowRadius={0.02}
            arrowLength={0.05}
          />
        )}
        {moonVisible && <Moon onFocus={selectMoon} showAxisLine={showAxisLine} />}
        {showPlanetLabels && moonVisible && (
          <PlanetNameLabel
            planetName="Moon"
            radius={moonRadiusToScene(MOON.radiusKm)}
            showZodiacSign={showZodiac}
          />
        )}
      </group>

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
