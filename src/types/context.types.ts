import type { AgentId } from "@/types/agent.types";

export interface ProjectContext {
  targetPath: string;
  detectedDependencies: string[];
  suggestedSkillIds: string[];
  detectedAgents: AgentId[];
  packageJsonExists: boolean;
}
