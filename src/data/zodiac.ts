export const SIGN_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

// Tropical-zodiac sign for a true (geocentric, unshifted) ecliptic longitude
// in degrees -- Aries is [0, 30), Taurus [30, 60), etc. `((deg % 360) + 360) % 360`
// normalizes negative/over-360 inputs before the bucket lookup.
export function signNameForLongitudeDeg(longitudeDeg: number): string {
  const normalized = ((longitudeDeg % 360) + 360) % 360;
  return SIGN_NAMES[Math.floor(normalized / 30)];
}
