import { cpSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import type { SkillMetadata } from "@/types/skill.types";

export class GeminiAdapter implements AgentAdapter {
  readonly id = "gemini" as const;
  readonly name = "Gemini Code Assist";
  readonly targetRelativeDir = ".gemini/skills";

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
