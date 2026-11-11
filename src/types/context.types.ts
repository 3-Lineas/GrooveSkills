import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

export interface ProjectContext {
  targetPath: string;
  detectedDependencies: string[];
  suggestedSkillIds: string[];
  installedSkillIds: string[];
  detectedAgents: AgentId[];
  packageJsonExists: boolean;
  harnessExists: boolean;
  configuredLanguage?: ProjectLanguage;
  configuredSkills?: string[];
  configuredAgents?: AgentId[];
  installedVersion?: string;
  configuredUpdatedAt?: string;
  hasLegacyConfigVersion?: boolean;
}

