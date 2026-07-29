import type { Vector3 } from "three";
import type { Fact } from "../data/facts";

export interface Selection {
  key: string;
  position: Vector3;
  radius: number;
  name: string;
  facts: Fact[];
}
