import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import { linkAgentProfile } from "@/domains/adapters/link-agent-profile";
import { linkAgentSkill } from "@/domains/adapters/skill-reference-builder";
import type { AgentProfileMetadata } from "@/types/agent-profile.types";
import type { SkillMetadata } from "@/types/skill.types";

export class AntigravityAdapter implements AgentAdapter {
  readonly id = "antigravity" as const;
  readonly name = "Antigravity";
  readonly targetRelativeDir = ".agents/skills";

  async installSkill(
    targetPath: string,
    skill: SkillMetadata,
    _skillSourceDir: string,
    transaction?: import("@/domains/fs/install-transaction").InstallTransaction
  ): Promise<string[]> {
    const symlinkPath = linkAgentSkill(targetPath, this.targetRelativeDir, skill, transaction);
    return [symlinkPath];
  }

  async installAgentProfile(
    targetPath: string,
    profile: AgentProfileMetadata,
    transaction?: import("@/domains/fs/install-transaction").InstallTransaction
  ): Promise<string[]> {
    return linkAgentProfile(targetPath, ".agents/agents", profile.fileName, transaction);
  }
}
