import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import { linkAgentSkill } from "@/domains/adapters/skill-reference-builder";
import type { SkillMetadata } from "@/types/skill.types";

export class GeminiAdapter implements AgentAdapter {
  readonly id = "gemini" as const;
  readonly name = "Gemini Code Assist";
  readonly targetRelativeDir = ".gemini/skills";

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
