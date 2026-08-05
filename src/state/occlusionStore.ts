import { create } from "zustand";
import type { RefObject } from "react";
import type { Object3D } from "three";

// Lets each body's mesh register itself as something planet labels should be
// hidden behind (see PlanetNameLabel/PlanetLabel's `occlude` prop), without
// SolarSystem having to thread refs down through every layer by hand.
interface OcclusionState {
  occludersById: Record<string, RefObject<Object3D | null>>;
  registerOccluder: (id: string, ref: RefObject<Object3D | null>) => void;
  unregisterOccluder: (id: string) => void;
}

export const useOcclusionStore = create<OcclusionState>((set) => ({
  occludersById: {},
  registerOccluder: (id, ref) =>
    set((state) => ({ occludersById: { ...state.occludersById, [id]: ref } })),
  unregisterOccluder: (id) =>
    set((state) => {
      const { [id]: _removed, ...rest } = state.occludersById;
      return { occludersById: rest };
    }),
}));
