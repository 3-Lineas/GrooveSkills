import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getGlobalCursorRulesDir } from "@/domains/global-store/global-paths";
import { createOrReplaceSymlink } from "@/domains/adapters/link-helper";
import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import type { SkillMetadata } from "@/types/skill.types";

export class CursorAdapter implements AgentAdapter {
  readonly id = "cursor" as const;
  readonly name = "Cursor";
  readonly targetRelativeDir = ".cursor/rules";

  async installSkill(
    targetPath: string,
    skill: SkillMetadata,
    _skillSourceDir: string
  ): Promise<string[]> {
    const rulesDir = join(targetPath, this.targetRelativeDir);
    if (!existsSync(rulesDir)) {
      mkdirSync(rulesDir, { recursive: true });
    }

    const filename = `${skill.id}.mdc`;
    const destination = join(rulesDir, filename);
    const globalRuleFile = join(getGlobalCursorRulesDir(), filename);

    createOrReplaceSymlink(globalRuleFile, destination, "file");

    return [destination];
  }
}
