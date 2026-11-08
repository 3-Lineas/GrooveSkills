import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import { linkAgentSkill } from "@/domains/adapters/skill-reference-builder";
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
}
