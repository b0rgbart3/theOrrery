import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { Color, DoubleSide, RingGeometry } from "three";
import { SUN_RADIUS, auToScene } from "../astronomy/scale";
import { PLANETS } from "../data/planets";
import { SIGN_NAMES } from "../data/zodiac";
import { ZODIAC_IMAGE_OPTIONS, type ZodiacImageStyle } from "./zodiacDisplay";

// Flush with the Sun's surface on the inside, out to Neptune's orbit (the
// outermost ring in the scene) on the outside.
const INNER_RADIUS = SUN_RADIUS;
const OUTER_RADIUS = auToScene(PLANETS[PLANETS.length - 1].semiMajorAxisAu);
const SEGMENTS = 128;

const SLICE_ANGLE = (Math.PI * 2) / SIGN_NAMES.length;
const SEGMENTS_PER_SLICE = 12;

interface ZodiacRingProps {
  /**
   * 180 (the default "Earth season" ring): the tropical zodiac's dates (e.g.
   * Leo = Jul 23-Aug 22) are defined by the Sun's GEOCENTRIC longitude —
   * Aries at [0, 30) deg means the Sun, seen from Earth, is there. But this
   * ring is drawn in the Sun's own (heliocentric) frame, where Earth sits
   * 180 deg away from wherever the Sun appears from Earth's point of view.
   * So on Aug 4 (Leo season), Earth's actual heliocentric longitude is ~180
   * deg past the Sun's geocentric longitude, not equal to it — without this
   * offset, Earth would visibly sit in whichever wedge is opposite the
   * correct sign.
   *
   * 0 (the "true" ring): wedges sit at their real, unshifted geocentric
   * longitude — the orientation a ray from Earth through another planet
   * needs to cross the wedge matching that planet's actual sign. This ring
   * is 180 deg (6 signs) rotated from the Earth-season ring above, so the
   * two are never shown at the same time.
   */
  offsetDeg?: number;
  /** Whether to draw the twelve color-coded sign wedges under the artwork. */
  showRainbow?: boolean;
  /** Which zodiac artwork texture to layer on top of the wedges. */
  imageStyle?: ZodiacImageStyle;
}

// Evenly spaced hues around the color wheel, so the twelve signs read as a
// classic zodiac wheel even before the artwork on top is considered. With
// offsetDeg=180, sign i spans heliocentric-longitude angle [i*30+180,
// i*30+210) degrees, i.e. Aries at [180, 210) — the wedge Earth actually
// sits in during Aries season (Mar 21-Apr 19), 180 deg from Aries's own
// [0, 30) tropical definition (see ZodiacRingProps.offsetDeg above).
function buildSigns(offsetDeg: number) {
  const offsetRad = (offsetDeg * Math.PI) / 180;
  return SIGN_NAMES.map((name, i) => ({
    name,
    color: new Color().setHSL(i / SIGN_NAMES.length, 0.55, 0.55),
    thetaStart: i * SLICE_ANGLE + offsetRad,
  }));
}

// RingGeometry's default UVs project the flat XY vertex position straight
// onto the texture square (u,v = vertex/outerRadius, remapped to 0-1) — the
// same projection a top-down circular graphic like zodiac.png was drawn in,
// so (unlike PlanetRing's radial-gradient texture) no custom UV remapping
// is needed here, just rotating the artwork into place.
//
// With no z-rotation, local angle 0 (+X in the ring's own plane) lands
// exactly on heliocentric-longitude 0 once flattened into the scene's XZ
// plane (rotation-x below). In the source artwork, Aries is centered at the
// top of the image (local angle 90 deg, where RingGeometry's UV formula
// puts v=1). We want that Aries-center point to end up at (15 + offsetDeg)
// deg — the midpoint of Aries's real [offsetDeg, offsetDeg+30) span above,
// not 15 — so spinning the artwork by that amount around the ring's own
// normal (z, applied before the flatten since three's default Euler order
// is XYZ) lines up every sign's wedge and printed date range with the
// plain color wedges below.
const ARIES_IMAGE_ANGLE_DEG = 90;

// Both zodiac.png and zodiac_outer_ring.png were exported with identical
// padding around the printed artwork: its opaque content only fills ~88.3%
// of the square canvas (measured from each PNG's alpha-channel bounding
// box), so RingGeometry's straight vertex/outerRadius UV mapping leaves the
// artwork's outer white border sitting visibly inside the rainbow wedges'
// true OUTER_RADIUS edge. Sampling just that central 88.3% of the texture
// and stretching it to fill the full 0-1 UV square crops the padding out,
// so the artwork's edge lines up with the wedges' edge, without having to
// re-export either source image.
const CONTENT_UV_SCALE = 1526 / 1728;

// A flat wheel offset straight down from the Sun's equatorial plane by a
// full solar radius, so it sits tangent to the Sun's bottom rather than
// slicing through it (and through every planet, which all orbit close to
// that equatorial plane): twelve color-coded wedges (one per zodiac sign)
// with the printed zodiac artwork layered on top at half opacity, so the
// colors still show through the artwork's dark background. Both layers are
// kept out of raycasting so they never steal clicks from the Sun or
// planets, and depthWrite is off so they can't z-fight with them (or each
// other).
export function ZodiacRing({
  offsetDeg = 180,
  showRainbow = true,
  imageStyle = "classic",
}: ZodiacRingProps) {
  const imageSrc =
    ZODIAC_IMAGE_OPTIONS.find((option) => option.style === imageStyle)?.src ??
    ZODIAC_IMAGE_OPTIONS[0].src;
  const texture = useTexture(imageSrc);
  texture.center.set(0.5, 0.5);
  texture.repeat.set(CONTENT_UV_SCALE, CONTENT_UV_SCALE);

  const signs = useMemo(() => buildSigns(offsetDeg), [offsetDeg]);
  const textureSpinRad = ((15 + offsetDeg - ARIES_IMAGE_ANGLE_DEG) * Math.PI) / 180;

  const geometries = useMemo(
    () =>
      signs.map(
        (sign) =>
          new RingGeometry(
            INNER_RADIUS,
            OUTER_RADIUS,
            SEGMENTS_PER_SLICE,
            1,
            sign.thetaStart,
            SLICE_ANGLE,
          ),
      ),
    [signs],
  );

  return (
    <group position={[0, -SUN_RADIUS, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {showRainbow &&
        signs.map((sign, i) => (
          <mesh key={sign.name} geometry={geometries[i]} raycast={() => null}>
            <meshBasicMaterial
              color={sign.color}
              transparent
              opacity={0.075}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      <mesh rotation={[0, 0, textureSpinRad]} raycast={() => null}>
        <ringGeometry args={[INNER_RADIUS, OUTER_RADIUS, SEGMENTS]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.3}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
