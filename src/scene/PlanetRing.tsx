import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { DoubleSide, RingGeometry, Vector3 } from "three";

interface PlanetRingProps {
  innerRadius: number;
  outerRadius: number;
  texture: string;
}

// RingGeometry's default UVs don't work for a radial-gradient ring texture
// (the image's horizontal axis is radius, not angle). Since RingGeometry only
// has two rows of vertices — one at innerRadius, one at outerRadius — mapping
// each vertex's U to its normalized radial distance is enough to line the
// texture up correctly all the way around.
export function PlanetRing({ innerRadius, outerRadius, texture: textureUrl }: PlanetRingProps) {
  const texture = useTexture(textureUrl);

  const geometry = useMemo(() => {
    const geo = new RingGeometry(innerRadius, outerRadius, 128, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const point = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      point.fromBufferAttribute(pos, i);
      const u = (point.length() - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, u, 1);
    }
    return geo;
  }, [innerRadius, outerRadius]);

  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2}>
      <meshBasicMaterial map={texture} side={DoubleSide} transparent opacity={0.85} />
    </mesh>
  );
}
