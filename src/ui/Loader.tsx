import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import "./Loader.scss";

// The scene's textures load through three.js's default loading manager, so
// once every useTexture() call across the app has resolved, `active` goes
// false and `progress` settles at 100 — that combination is what tells us
// the (unknown-size) initial load is actually done, vs. a texture load
// starting up.
export function Loader() {
  const { active, progress } = useProgress();
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (active || progress < 100) return;
    // Small delay so the fade-out reads as a transition rather than a snap.
    const timeout = setTimeout(() => setShown(false), 200);
    return () => clearTimeout(timeout);
  }, [active, progress]);

  if (!shown) return null;

  return (
    <div className={`loader ${!active && progress === 100 ? "loader--done" : ""}`} role="status" aria-label="Loading">
      <div className="loader__ring" />
    </div>
  );
}
