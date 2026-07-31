import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SolarSystem } from "./scene/SolarSystem";
import { ViewportShift } from "./scene/ViewportShift";
import type { Selection } from "./scene/selection";
import type { OrbitDisplayMode } from "./scene/orbitDisplay";
import { Timeline } from "./ui/Timeline";
import { Title } from "./ui/Title";

export default function App() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [orbitMode, setOrbitMode] = useState<OrbitDisplayMode>("regular");

  return (
    <>
      <Canvas camera={{ position: [0, 45, 95], fov: 50, far: 2000 }} onPointerMissed={() => setSelection(null)}>
        <color attach="background" args={["#000005"]} />
        <Stars radius={400} depth={100} count={6000} factor={10} saturation={0} fade />
        <ViewportShift />
        <SolarSystem selection={selection} onSelect={setSelection} orbitMode={orbitMode} />
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.4} luminanceSmoothing={0.2} mipmapBlur />
        </EffectComposer>
      </Canvas>
      <Title />
      <Timeline orbitMode={orbitMode} onOrbitModeChange={setOrbitMode} />
    </>
  );
}
