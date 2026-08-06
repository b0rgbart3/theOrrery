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
  const [planetaryZodiacPlanets, setPlanetaryZodiacPlanets] = useState<string[]>([]);
  // Only one zodiac ring can ever be shown at once (see ZodiacRing.tsx --
  // the Earth-season and true rings are 180 deg apart), so these two are
  // kept mutually exclusive by auto-toggling the other off, rather than by
  // disabling checkboxes -- either can be turned on freely, and doing so
  // just quietly turns the other off instead of landing in a dead state
  // where a checkbox is checked but nothing it controls is visible.
  const showPlanetaryZodiac = planetaryZodiacPlanets.length > 0;
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { active, progress } = useProgress();
  const isReady = !active && progress === 100;

  const handleShowZodiacChange = (show: boolean) => {
    setShowZodiac(show);
    const nextPlanetaryPlanets = show ? [] : planetaryZodiacPlanets;
    if (show) setPlanetaryZodiacPlanets([]);
    setOrbitMode(show || nextPlanetaryPlanets.length > 0 ? "hidden" : "regular");
  };

  const handleTogglePlanetaryZodiacPlanet = (planetName: string, show: boolean) => {
    const nextPlanets = show
      ? [...planetaryZodiacPlanets, planetName]
      : planetaryZodiacPlanets.filter((name) => name !== planetName);
    setPlanetaryZodiacPlanets(nextPlanets);
    const nextShowZodiac = show ? false : showZodiac;
    if (show) setShowZodiac(false);
    setOrbitMode(nextShowZodiac || nextPlanets.length > 0 ? "hidden" : "regular");
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
          showPlanetaryZodiac={showPlanetaryZodiac}
          planetaryZodiacPlanets={planetaryZodiacPlanets}
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
          planetaryZodiacPlanets={planetaryZodiacPlanets}
          onTogglePlanetaryZodiacPlanet={handleTogglePlanetaryZodiacPlanet}
          orbitMode={orbitMode}
          onOrbitModeChange={setOrbitMode}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {isReady && <Timeline onOpenSettings={() => setSettingsOpen(true)} />}
    </>
  );
}
