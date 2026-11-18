export type SkillCategory =
  | "Core & Methodology"
  | "Architecture & Adapters"
  | "GroovePack"
  | "Languages & Testing"
  | "Frameworks & UI";

export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  dependencies: string[];
  directoryName: string;
  isCoreHarness?: boolean;
}
