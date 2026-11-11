import type { AgentId } from "@/types/agent.types";

export type ProjectLanguage = "es" | "en" | "pt" | "it" | "fr";

export interface GrooveSkillsConfig {
  version: string;
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
  forceOnboarding?: boolean;
  transaction?: import("@/domains/fs/install-transaction").InstallTransaction;
}

export interface HarnessInstallResult {
  createdFiles: string[];
  onboardingInitialized: boolean;
}
