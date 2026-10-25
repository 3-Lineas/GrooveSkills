import { cpSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import type { SkillMetadata } from "@/types/skill.types";

export class AntigravityAdapter implements AgentAdapter {
  readonly id = "antigravity" as const;
  readonly name = "Antigravity";
  readonly targetRelativeDir = ".agents/skills";

  async installSkill(
    targetPath: string,
    skill: SkillMetadata,
    skillSourceDir: string
  ): Promise<string[]> {
    const destination = join(targetPath, this.targetRelativeDir, skill.directoryName);

    if (!existsSync(destination)) {
      mkdirSync(destination, { recursive: true });
    }

    cpSync(skillSourceDir, destination, { recursive: true });

    return [destination];
  }
}
