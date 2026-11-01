import type { AgentId } from "@/types/agent.types";

export type ProjectLanguage = "es" | "en" | "pt" | "it" | "fr";

export interface GrooveSkillsConfig {
  version: number;
  harness: boolean;
  language?: ProjectLanguage;
  agents: AgentId[];
  skills: string[];
  updatedAt: string;
}

export interface HarnessInstallOptions {
  targetPath: string;
  selectedAgents: AgentId[];
  selectedSkillIds: string[];
  detectedDependencies: string[];
  language?: ProjectLanguage;
}
