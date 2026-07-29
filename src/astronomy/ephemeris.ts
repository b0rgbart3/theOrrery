import * as Astronomy from "astronomy-engine";
import { auToScene } from "./scale";

// astronomy-engine's HelioVector returns equatorial J2000 (EQJ) coordinates.
// Rotate into ecliptic J2000 (ECL) so the shared orbital plane maps onto the
// scene's XZ ground plane, with the small out-of-plane component (z) mapped
// onto scene Y — that's what makes an inclined orbit like Mercury's visibly
// bob above/below the mean plane instead of everything looking artificially flat.
const EQJ_TO_ECL = Astronomy.Rotation_EQJ_ECL();

export function heliocentricScenePosition(planetName: string, date: Date): [number, number, number] {
  const body = Astronomy.Body[planetName as keyof typeof Astronomy.Body];
  const equatorial = Astronomy.HelioVector(body, date);
  const ecliptic = Astronomy.RotateVector(EQJ_TO_ECL, equatorial);

  const distanceAu = ecliptic.Length();
  const sceneDistance = auToScene(distanceAu);
  const scale = distanceAu === 0 ? 0 : sceneDistance / distanceAu;

  return [ecliptic.x * scale, ecliptic.z * scale, ecliptic.y * scale];
}
