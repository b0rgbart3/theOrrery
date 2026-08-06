import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useTimeStore } from "../state/timeStore";

interface FollowBodyProps {
  getPosition: (date: Date) => [number, number, number];
  children: ReactNode;
}

// Repositions its children to a live, moving position every frame without
// forcing a React re-render -- the same imperative-ref pattern OrbitPath's
// followCenter uses for the Moon's orbit. Used to center the "true" zodiac
// ring on Earth (see PlanetZodiacRay.tsx) instead of the Sun.
export function FollowBody({ getPosition, children }: FollowBodyProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const simDate = useTimeStore.getState().simDate;
    groupRef.current.position.set(...getPosition(simDate));
  });

  return <group ref={groupRef}>{children}</group>;
}
