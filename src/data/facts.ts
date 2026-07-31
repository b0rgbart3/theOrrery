import type { PlanetData } from "./planets";

export interface Fact {
  label: string;
  value: string;
}

function formatPeriod(days: number): string {
  return days >= 365 ? `${(days / 365.25).toFixed(1)} years` : `${Math.round(days)} days`;
}

export function planetFacts(planet: PlanetData): Fact[] {
  return [
    { label: "Radius", value: `${planet.radiusKm.toLocaleString()} km` },
    { label: "Distance from Sun", value: `${planet.semiMajorAxisAu.toFixed(2)} AU` },
    { label: "Orbital period", value: formatPeriod(planet.orbitalPeriodDays) },
    { label: "Axial tilt", value: `${planet.axialTiltDeg.toFixed(1)}°` },
  ];
}

export const SUN_FACTS: Fact[] = [
  { label: "Type", value: "G-type main-sequence star (G2V)" },
  { label: "Radius", value: "696,000 km" },
  { label: "Surface temp.", value: "~5,500 °C" },
];

export const MOON_FACTS: Fact[] = [
  { label: "Radius", value: "1,737.4 km" },
  { label: "Distance from Earth", value: "384,400 km (avg)" },
  { label: "Orbital period", value: "27.3 days" },
  { label: "Axial tilt", value: "6.7° (to its orbit)" },
];
