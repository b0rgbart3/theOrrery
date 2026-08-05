import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, useProgress } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SolarSystem } from "./scene/SolarSystem";
import { ViewportShift } from "./scene/ViewportShift";
import type { Selection } from "./scene/selection";
import type { OrbitDisplayMode } from "./scene/orbitDisplay";
import { Timeline } from "./ui/Timeline";
import { Title } from "./ui/Title";
import { InfoPanel } from "./ui/InfoPanel";
import { SettingsModal } from "./ui/SettingsModal";
import { Loader } from "./ui/Loader";

export default function App() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [orbitMode, setOrbitMode] = useState<OrbitDisplayMode>("regular");
  const [showAxisLine, setShowAxisLine] = useState(true);
  const [showPlanetLabels, setShowPlanetLabels] = useState(true);
  const [showZodiac, setShowZodiac] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { active, progress } = useProgress();
  const isReady = !active && progress === 100;

  const handleShowZodiacChange = (show: boolean) => {
    setShowZodiac(show);
    if (show) setOrbitMode("hidden");
  };

  return (
    <>
      <Canvas camera={{ position: [0, 45, 95], fov: 50, far: 2000 }} onPointerMissed={() => setSelection(null)}>
        <color attach="background" args={["#000005"]} />
        <Stars radius={400} depth={100} count={6000} factor={10} saturation={0} fade />
        <ViewportShift />
        <SolarSystem
          selection={selection}
          onSelect={setSelection}
          orbitMode={orbitMode}
          showAxisLine={showAxisLine}
          showPlanetLabels={showPlanetLabels}
          showZodiac={showZodiac}
        />
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.4} luminanceSmoothing={0.2} mipmapBlur />
        </EffectComposer>
      </Canvas>
      <Loader />
      <Title onClick={() => setAboutOpen(true)} />
      <InfoPanel aboutOpen={aboutOpen} onAboutOpenChange={setAboutOpen} />
      {settingsOpen && (
        <SettingsModal
          showAxisLine={showAxisLine}
          onShowAxisLineChange={setShowAxisLine}
          showPlanetLabels={showPlanetLabels}
          onShowPlanetLabelsChange={setShowPlanetLabels}
          showZodiac={showZodiac}
          onShowZodiacChange={handleShowZodiacChange}
          orbitMode={orbitMode}
          onOrbitModeChange={setOrbitMode}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {isReady && <Timeline onOpenSettings={() => setSettingsOpen(true)} />}
    </>
  );
}
