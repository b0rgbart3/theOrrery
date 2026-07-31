export type OrbitDisplayMode = "hidden" | "dim" | "regular" | "bright" | "selected";
export type OrbitVariant = "dim" | "regular" | "bright";

export const ORBIT_DISPLAY_OPTIONS: { mode: OrbitDisplayMode; label: string }[] = [
  { mode: "hidden", label: "Hidden" },
  { mode: "dim", label: "Dim" },
  { mode: "regular", label: "Regular" },
  { mode: "bright", label: "Bright" },
  { mode: "selected", label: "Selected planet highlight" },
];
