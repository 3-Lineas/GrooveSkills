import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

export interface InstallOptions {
  targetPath: string;
  selectedSkillIds: string[];
  selectedAgents: AgentId[];
  forceOverwrite: boolean;
  enableHarness?: boolean;
  detectedDependencies?: string[];
  language?: ProjectLanguage;
}

export interface InstallResult {
  installedSkills: string[];
  configuredAgents: AgentId[];
  createdFiles: string[];
  harnessInitialized: boolean;
  language?: ProjectLanguage;
}
