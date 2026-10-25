import type { AgentId } from "@/types/agent.types";
import type { SkillMetadata } from "@/types/skill.types";

export interface AgentAdapter {
  id: AgentId;
  name: string;
  targetRelativeDir: string;
  installSkill(targetPath: string, skill: SkillMetadata, skillSourceDir: string): Promise<string[]>;
}
