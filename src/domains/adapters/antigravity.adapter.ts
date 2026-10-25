import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getGlobalSkillsDir } from "@/domains/global-store/global-paths";
import { createOrReplaceSymlink } from "@/domains/adapters/link-helper";
import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
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
    const parentDir = join(targetPath, this.targetRelativeDir);
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }

    const destination = join(parentDir, skill.directoryName);
    const globalSkillDir = join(getGlobalSkillsDir(), skill.directoryName);

    createOrReplaceSymlink(globalSkillDir, destination, "dir");

    return [destination];
  }
}
