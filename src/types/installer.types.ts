import type { AgentId } from "@/types/agent.types";

export interface InstallOptions {
  targetPath: string;
  selectedSkillIds: string[];
  selectedAgents: AgentId[];
  forceOverwrite: boolean;
}

export interface InstallResult {
  installedSkills: string[];
  configuredAgents: AgentId[];
  createdFiles: string[];
}
