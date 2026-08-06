export type ZodiacImageStyle = "classic" | "outerRing";

export const ZODIAC_IMAGE_OPTIONS: { style: ZodiacImageStyle; label: string; src: string }[] = [
  { style: "classic", label: "Classic", src: "/textures/zodiac.png" },
  { style: "outerRing", label: "Outer ring", src: "/textures/zodiac_outer_ring.png" },
];
