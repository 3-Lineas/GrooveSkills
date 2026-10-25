import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import type { SkillMetadata } from "@/types/skill.types";

export class CursorAdapter implements AgentAdapter {
  readonly id = "cursor" as const;
  readonly name = "Cursor";
  readonly targetRelativeDir = ".cursor/rules";

  async installSkill(
    targetPath: string,
    skill: SkillMetadata,
    skillSourceDir: string
  ): Promise<string[]> {
    const rulesDir = join(targetPath, this.targetRelativeDir);

    if (!existsSync(rulesDir)) {
      mkdirSync(rulesDir, { recursive: true });
    }

    const skillMdPath = join(skillSourceDir, "SKILL.md");
    let content = "";

    if (existsSync(skillMdPath)) {
      content = readFileSync(skillMdPath, "utf-8");
    }

    const mdcHeader = `---
description: ${skill.description}
globs: ["**/*"]
alwaysApply: false
---

`;

    const cleanedBody = content.replace(/^---[\s\S]*?---\s*/, "");
    const targetFile = join(rulesDir, `${skill.id}.mdc`);

    writeFileSync(targetFile, `${mdcHeader}${cleanedBody}`, "utf-8");

    return [targetFile];
  }
}
