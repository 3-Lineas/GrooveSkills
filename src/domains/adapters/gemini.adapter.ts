import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import { writeAgentSkillReference } from "@/domains/adapters/skill-reference-builder";
import type { SkillMetadata } from "@/types/skill.types";

export class GeminiAdapter implements AgentAdapter {
  readonly id = "gemini" as const;
  readonly name = "Gemini Code Assist";
  readonly targetRelativeDir = ".gemini/skills";

  async installSkill(
    targetPath: string,
    skill: SkillMetadata,
    _skillSourceDir: string
  ): Promise<string[]> {
    const file = writeAgentSkillReference(targetPath, this.targetRelativeDir, skill);
    return [file];
  }
}
