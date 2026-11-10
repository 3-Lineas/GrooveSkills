import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";
import type { ReplacedFileNotice } from "@/domains/fs/install-transaction";

export interface InstallOptions {
  targetPath: string;
  selectedSkillIds: string[];
  selectedAgents: AgentId[];
  forceOverwrite: boolean;
  enableHarness?: boolean;
  detectedDependencies?: string[];
  language?: ProjectLanguage;
  forceOnboarding?: boolean;
  skillsToRemove?: string[];
}

export interface InstallResult {
  installedSkills: string[];
  configuredAgents: AgentId[];
  createdFiles: string[];
  harnessInitialized: boolean;
  language?: ProjectLanguage;
  replacedFiles?: ReplacedFileNotice[];
  removedSkills?: string[];
}
