import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group, Object3D } from "three";
import {
  scenePositionForKey,
  geocentricEclipticLongitudeDeg,
  sunEclipticLongitudeDeg,
} from "../astronomy/ephemeris";
import { signNameForLongitudeDeg } from "../data/zodiac";
import { useTimeStore } from "../state/timeStore";
import { useOcclusionStore } from "../state/occlusionStore";
import "./PlanetNameLabel.scss";

interface PlanetNameLabelProps {
  planetName: string;
  radius: number;
  /**
   * Appends the body's current true zodiac sign below its name. For every
   * planet (and the Moon) this is the real geocentric sign; Earth has no
   * meaningful sign relative to itself, so it gets the Sun's geocentric
   * sign instead -- the traditional birthday "sun sign."
   */
  showZodiacSign?: boolean;
}

// A screen-space overlay (not 3D-rotated) whose diagonal leader line always
// reads the same way regardless of camera angle -- anchored to the body's
// live position the same way PlanetLabel is, so it tracks orbital motion
// during playback.
export function PlanetNameLabel({ planetName, radius, showZodiacSign = false }: PlanetNameLabelProps) {
  const groupRef = useRef<Group>(null);
  const zodiacRef = useRef<HTMLSpanElement>(null);
  const occludersById = useOcclusionStore((s) => s.occludersById);
  // Every other body can hide this label, but not this body's own mesh --
  // the anchor point sits right on the planet's surface, so including
  // itself would flicker the label out at grazing viewing angles.
  const occluders = useMemo(
    () => Object.entries(occludersById)
      .filter(([id]) => id !== planetName)
      // drei's occlude prop type predates React 19's nullable RefObject --
      // Html only ever reads `.current`, which safely tolerates null.
      .map(([, ref]) => ref as RefObject<Object3D>),
    [occludersById, planetName]
  );

  useFrame(() => {
    if (!groupRef.current) return;
    const simDate = useTimeStore.getState().simDate;
    const [x, y, z] = scenePositionForKey(planetName, simDate);
    groupRef.current.position.set(x, y + radius, z);
    if (showZodiacSign && zodiacRef.current) {
      const elon =
        planetName === "Earth"
          ? sunEclipticLongitudeDeg(simDate)
          : geocentricEclipticLongitudeDeg(planetName, simDate);
      zodiacRef.current.textContent = signNameForLongitudeDeg(elon);
    }
  });

  return (
    <group ref={groupRef}>
      <Html zIndexRange={[1, 0]} occlude={occluders}>
        <div className="planet-name-label">
          <span className="planet-name-label__dot" />
          <span className="planet-name-label__line" />
          <span className="planet-name-label__text">
            {planetName}
            {showZodiacSign && <span ref={zodiacRef} className="planet-name-label__zodiac" />}
          </span>
        </div>
      </Html>
    </group>
  );
}
