export type OrbitDisplayMode = "hidden" | "dim" | "regular" | "bright" | "xbright" | "selected";
export type OrbitVariant = "dim" | "regular" | "bright" | "xbright";

export const ORBIT_DISPLAY_OPTIONS: { mode: OrbitDisplayMode; label: string }[] = [
  { mode: "hidden", label: "Hidden" },
  { mode: "dim", label: "Dim" },
  { mode: "regular", label: "Regular" },
  { mode: "bright", label: "Bright" },
  { mode: "xbright", label: "Extra bright" },
  { mode: "selected", label: "Selected planet highlight" },
];
