export interface PlanetRingData {
  innerRadiusFactor: number; // multiples of the planet's own scene radius
  outerRadiusFactor: number;
  texture: string;
}

export interface PlanetAtmosphereData {
  texture: string;
  /** Multiple of the planet's own scene radius, e.g. 1.1 for 10% larger. */
  scaleFactor: number;
  opacity: number;
}

export interface PlanetData {
  name: string;
  radiusKm: number;
  semiMajorAxisAu: number;
  orbitalPeriodDays: number;
  axialTiltDeg: number;
  /**
   * Sidereal rotation period in hours, as a positive magnitude. Retrograde
   * spin (Venus, Uranus) is NOT encoded here as a negative sign — it falls
   * out automatically from axialTiltDeg being past 90°, which flips the
   * planet's local spin axis far enough that a "positive" spin around it
   * reads as backwards from an external viewpoint. That >90° condition is
   * the actual astronomical definition of retrograde, so this is the only
   * source of truth needed for spin direction.
   */
  rotationPeriodHours: number;
  texture: string;
  /** Approximate dominant surface/cloud color, used to color-code its orbit path. */
  color: string;
  ring?: PlanetRingData;
  atmosphere?: PlanetAtmosphereData;
}

export const PLANETS: PlanetData[] = [
  { name: "Mercury", radiusKm: 2439.7, semiMajorAxisAu: 0.387, orbitalPeriodDays: 88, axialTiltDeg: 0.03, rotationPeriodHours: 1407.6, texture: "/textures/mercury.jpg", color: "#9c9186" },
  { name: "Venus", radiusKm: 6051.8, semiMajorAxisAu: 0.723, orbitalPeriodDays: 224.7, axialTiltDeg: 177.4, rotationPeriodHours: 5832.6, texture: "/textures/venus.jpg", color: "#d9c27e" },
  {
    name: "Earth",
    radiusKm: 6371,
    semiMajorAxisAu: 1,
    orbitalPeriodDays: 365.25,
    axialTiltDeg: 23.44,
    rotationPeriodHours: 23.934,
    texture: "/textures/earth.jpg",
    color: "#4a90d9",
    atmosphere: { texture: "/textures/earth_clouds.png", scaleFactor: 1.05, opacity: 0.75 },
  },
  { name: "Mars", radiusKm: 3389.5, semiMajorAxisAu: 1.524, orbitalPeriodDays: 687, axialTiltDeg: 25.19, rotationPeriodHours: 24.623, texture: "/textures/mars.jpg", color: "#c1592f" },
  { name: "Jupiter", radiusKm: 69911, semiMajorAxisAu: 5.203, orbitalPeriodDays: 4331, axialTiltDeg: 3.13, rotationPeriodHours: 9.925, texture: "/textures/jupiter.jpg", color: "#d2a679" },
  {
    name: "Saturn",
    radiusKm: 58232,
    semiMajorAxisAu: 9.537,
    orbitalPeriodDays: 10747,
    axialTiltDeg: 26.73,
    rotationPeriodHours: 10.656,
    texture: "/textures/saturn.jpg",
    color: "#e3c98f",
    ring: { innerRadiusFactor: 1.2, outerRadiusFactor: 2.3, texture: "/textures/saturn_ring.png" },
  },
  { name: "Uranus", radiusKm: 25362, semiMajorAxisAu: 19.191, orbitalPeriodDays: 30589, axialTiltDeg: 97.77, rotationPeriodHours: 17.24, texture: "/textures/uranus.jpg", color: "#9fd9d4" },
  { name: "Neptune", radiusKm: 24622, semiMajorAxisAu: 30.07, orbitalPeriodDays: 59800, axialTiltDeg: 28.32, rotationPeriodHours: 16.11, texture: "/textures/neptune.jpg", color: "#4361ee" },
];
