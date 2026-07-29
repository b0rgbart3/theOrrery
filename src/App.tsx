import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SolarSystem } from "./scene/SolarSystem";
import type { Selection } from "./scene/selection";

export default function App() {
  const [selection, setSelection] = useState<Selection | null>(null);

  return (
    <Canvas camera={{ position: [0, 45, 95], fov: 50, far: 2000 }} onPointerMissed={() => setSelection(null)}>
      <color attach="background" args={["#000005"]} />
      <Stars radius={400} depth={100} count={6000} factor={4} fade />
      <SolarSystem selection={selection} onSelect={setSelection} />
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.4} luminanceSmoothing={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
