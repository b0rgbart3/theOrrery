import { create } from "zustand";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SpeedPreset {
  label: string;
  daysPerSecond: number;
}

export const SPEED_PRESETS: SpeedPreset[] = [
  { label: "Real-time", daysPerSecond: 1 / 86400 },
  { label: "1 hour/sec", daysPerSecond: 1 / 24 },
  { label: "1 day/sec", daysPerSecond: 1 },
  { label: "1 week/sec", daysPerSecond: 7 },
  { label: "1 month/sec", daysPerSecond: 30 },
  { label: "1 year/sec", daysPerSecond: 365.25 },
];

interface TimeState {
  simDate: Date;
  daysPerSecond: number;
  isPlaying: boolean;
  isScrubbing: boolean;
  // When true, simDate continuously tracks the actual current time each
  // frame (a live clock) instead of the manual daysPerSecond playback below.
  // Any manual interaction (play, speed change, scrub) disengages it; the
  // "Now" button re-engages it and snaps back to the real date.
  isLive: boolean;
  setDaysPerSecond: (value: number) => void;
  togglePlaying: () => void;
  toggleLive: () => void;
  scrubTo: (date: Date) => void;
  setScrubbing: (active: boolean) => void;
  advance: (deltaSeconds: number) => void;
}

// Read via useTimeStore.getState() inside useFrame callbacks rather than the
// hook, so continuous per-frame updates (position, camera tracking) don't
// force a React re-render on every animation frame — only UI that actually
// needs to redraw on time changes (the Timeline) should subscribe reactively.
export const useTimeStore = create<TimeState>((set, get) => ({
  simDate: new Date(),
  daysPerSecond: 1,
  isPlaying: false,
  isScrubbing: false,
  isLive: true,
  setDaysPerSecond: (value) => set({ daysPerSecond: value, isLive: false }),
  togglePlaying: () => set((s) => ({ isPlaying: !s.isPlaying, isLive: false })),
  toggleLive: () =>
    set((s) =>
      s.isLive ? { isLive: false } : { isLive: true, isPlaying: false, simDate: new Date() }
    ),
  scrubTo: (date) => set({ simDate: date, isPlaying: false, isLive: false }),
  setScrubbing: (active) => set({ isScrubbing: active }),
  advance: (deltaSeconds) => {
    const { isLive, isPlaying, daysPerSecond, simDate } = get();
    if (isLive) {
      set({ simDate: new Date() });
      return;
    }
    if (!isPlaying) return;
    set({ simDate: new Date(simDate.getTime() + daysPerSecond * DAY_MS * deltaSeconds) });
  },
}));
