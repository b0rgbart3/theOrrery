import { useState, type ChangeEvent, type CSSProperties } from "react";
import { useTimeStore, SPEED_PRESETS } from "../state/timeStore";
import { ORBIT_DISPLAY_OPTIONS, type OrbitDisplayMode } from "../scene/orbitDisplay";
import "./Timeline.scss";

const DAY_MS = 24 * 60 * 60 * 1000;
const SCRUB_RANGE_DAYS = 365 * 5; // +/- 5 years around the page's load time

interface TimelineProps {
  orbitMode: OrbitDisplayMode;
  onOrbitModeChange: (mode: OrbitDisplayMode) => void;
}

export function Timeline({ orbitMode, onOrbitModeChange }: TimelineProps) {
  const simDate = useTimeStore((s) => s.simDate);
  const isPlaying = useTimeStore((s) => s.isPlaying);
  const daysPerSecond = useTimeStore((s) => s.daysPerSecond);
  const setDaysPerSecond = useTimeStore((s) => s.setDaysPerSecond);
  const togglePlaying = useTimeStore((s) => s.togglePlaying);
  const resetToNow = useTimeStore((s) => s.resetToNow);
  const scrubTo = useTimeStore((s) => s.scrubTo);
  const setScrubbing = useTimeStore((s) => s.setScrubbing);

  // Fixed reference point for the scrub slider's range — doesn't drift as
  // simDate itself advances during playback.
  const [epochNow] = useState(() => Date.now());
  const offsetDays = (simDate.getTime() - epochNow) / DAY_MS;
  const scrubProgress = Math.min(
    100,
    Math.max(0, ((offsetDays + SCRUB_RANGE_DAYS) / (2 * SCRUB_RANGE_DAYS)) * 100)
  );

  function handleScrub(event: ChangeEvent<HTMLInputElement>) {
    const days = Number(event.target.value);
    scrubTo(new Date(epochNow + days * DAY_MS));
  }

  function handleSpeedChange(event: ChangeEvent<HTMLSelectElement>) {
    const preset = SPEED_PRESETS.find((p) => p.label === event.target.value);
    if (preset) setDaysPerSecond(preset.daysPerSecond);
  }

  const currentPreset = SPEED_PRESETS.find((p) => p.daysPerSecond === daysPerSecond) ?? SPEED_PRESETS[0];

  return (
    <div className="timeline">
      <button onClick={togglePlaying} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? "⏸" : "▶"}
      </button>

      <input
        className="timeline__scrub"
        type="range"
        min={-SCRUB_RANGE_DAYS}
        max={SCRUB_RANGE_DAYS}
        step={1}
        value={offsetDays}
        style={{ "--scrub-progress": `${scrubProgress}%` } as CSSProperties}
        onChange={handleScrub}
        onPointerDown={() => setScrubbing(true)}
        onPointerUp={() => setScrubbing(false)}
        aria-label="Scrub timeline"
      />

      <select value={currentPreset.label} onChange={handleSpeedChange} aria-label="Playback speed">
        {SPEED_PRESETS.map((preset) => (
          <option key={preset.label} value={preset.label}>
            {preset.label}
          </option>
        ))}
      </select>

      <button onClick={resetToNow}>Now</button>

      <span className="timeline__date">
        {simDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
      </span>

      <select
        value={orbitMode}
        onChange={(e) => onOrbitModeChange(e.target.value as OrbitDisplayMode)}
        aria-label="Orbit path display"
      >
        {ORBIT_DISPLAY_OPTIONS.map((option) => (
          <option key={option.mode} value={option.mode}>
            Orbits: {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
