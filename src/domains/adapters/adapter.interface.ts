import type { AgentId } from "@/types/agent.types";
import type { AgentProfileMetadata } from "@/types/agent-profile.types";
import type { SkillMetadata } from "@/types/skill.types";

export interface AgentAdapter {
  id: AgentId;
  name: string;
  targetRelativeDir: string;
  installSkill(
    targetPath: string,
    skill: SkillMetadata,
    skillSourceDir: string,
    transaction?: import("@/domains/fs/install-transaction").InstallTransaction
  ): Promise<string[]>;
  installAgentProfile?(
    targetPath: string,
    profile: AgentProfileMetadata,
    transaction?: import("@/domains/fs/install-transaction").InstallTransaction
  ): Promise<string[]>;
}
