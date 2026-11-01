import type { AgentId } from "@/types/agent.types";

export interface GrooveSkillsConfig {
  version: number;
  harness: boolean;
  agents: AgentId[];
  skills: string[];
  updatedAt: string;
}

export interface HarnessInstallOptions {
  targetPath: string;
  selectedAgents: AgentId[];
  selectedSkillIds: string[];
  detectedDependencies: string[];
}
