import type { Fact } from "../data/facts";

export interface Selection {
  key: string;
  radius: number;
  name: string;
  facts: Fact[];
}
