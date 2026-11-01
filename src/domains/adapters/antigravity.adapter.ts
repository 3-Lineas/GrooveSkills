import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import { writeAgentSkillReference } from "@/domains/adapters/skill-reference-builder";
import type { SkillMetadata } from "@/types/skill.types";

export class AntigravityAdapter implements AgentAdapter {
  readonly id = "antigravity" as const;
  readonly name = "Antigravity";
  readonly targetRelativeDir = ".agents/skills";

  async installSkill(
    targetPath: string,
    skill: SkillMetadata,
    _skillSourceDir: string
  ): Promise<string[]> {
    const file = writeAgentSkillReference(targetPath, this.targetRelativeDir, skill);
    return [file];
  }
}
