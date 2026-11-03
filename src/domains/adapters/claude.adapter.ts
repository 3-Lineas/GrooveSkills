import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import { writeAgentSkillReference } from "@/domains/adapters/skill-reference-builder";
import type { SkillMetadata } from "@/types/skill.types";

export class ClaudeAdapter implements AgentAdapter {
  readonly id = "claude" as const;
  readonly name = "Claude Code";
  readonly targetRelativeDir = ".claude/skills";

  async installSkill(
    targetPath: string,
    skill: SkillMetadata,
    _skillSourceDir: string,
    transaction?: import("@/domains/fs/install-transaction").InstallTransaction
  ): Promise<string[]> {
    const file = writeAgentSkillReference(targetPath, this.targetRelativeDir, skill, transaction);
    return [file];
  }
}
