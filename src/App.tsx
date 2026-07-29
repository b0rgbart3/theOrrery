import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SolarSystem } from "./scene/SolarSystem";

export default function App() {
  return (
    <Canvas camera={{ position: [0, 6, 16], fov: 50 }}>
      <color attach="background" args={["#000005"]} />
      <Stars radius={200} depth={60} count={4000} factor={4} fade />
      <SolarSystem />
      <OrbitControls enableDamping dampingFactor={0.08} minDistance={6} maxDistance={80} />
      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.4} luminanceSmoothing={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
