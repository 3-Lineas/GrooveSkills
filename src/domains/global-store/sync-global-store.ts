import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getGlobalSkillsDir, getGlobalCursorRulesDir } from "@/domains/global-store/global-paths";
import { resolveSkillsSourceRoot } from "@/domains/installer/resolve-skills-source";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

export function syncGlobalStore(): void {
  const bundledSkillsDir = resolveSkillsSourceRoot();
  const globalSkillsDir = getGlobalSkillsDir();
  const globalCursorRulesDir = getGlobalCursorRulesDir();

  if (!existsSync(globalSkillsDir)) {
    mkdirSync(globalSkillsDir, { recursive: true });
  }
  if (!existsSync(globalCursorRulesDir)) {
    mkdirSync(globalCursorRulesDir, { recursive: true });
  }

  cpSync(bundledSkillsDir, globalSkillsDir, { recursive: true });

  for (const skill of SKILL_CATALOG) {
    const skillMdPath = join(globalSkillsDir, skill.directoryName, "SKILL.md");
    if (!existsSync(skillMdPath)) {
      continue;
    }

    const content = readFileSync(skillMdPath, "utf-8");
    const mdcHeader = `---
description: ${skill.description}
globs: ["**/*"]
alwaysApply: false
---

`;
    const cleanedBody = content.replace(/^---[\s\S]*?---\s*/, "");
    const targetMdc = join(globalCursorRulesDir, `${skill.id}.mdc`);
    writeFileSync(targetMdc, `${mdcHeader}${cleanedBody}`, "utf-8");
  }
}
