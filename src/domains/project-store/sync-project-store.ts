import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getProjectSkillsDir,
  getProjectCursorRulesDir,
} from "@/domains/project-store/project-paths";
import { resolveSkillsSourceRoot } from "@/domains/installer/resolve-skills-source";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { AgentId } from "@/types/agent.types";

export function syncProjectStore(
  targetPath: string,
  selectedSkillIds: string[],
  selectedAgents: AgentId[]
): void {
  const bundledSkillsDir = resolveSkillsSourceRoot();
  const projectSkillsDir = getProjectSkillsDir(targetPath);
  const projectCursorRulesDir = getProjectCursorRulesDir(targetPath);

  if (!existsSync(projectSkillsDir)) {
    mkdirSync(projectSkillsDir, { recursive: true });
  }

  const needsCursorRules = selectedAgents.includes("cursor");
  if (needsCursorRules && !existsSync(projectCursorRulesDir)) {
    mkdirSync(projectCursorRulesDir, { recursive: true });
  }

  for (const skillId of selectedSkillIds) {
    const skill = SKILL_CATALOG.find((item) => item.id === skillId);
    if (!skill) {
      continue;
    }

    const sourceSkillDir = join(bundledSkillsDir, skill.directoryName);
    const destSkillDir = join(projectSkillsDir, skill.directoryName);

    if (existsSync(sourceSkillDir)) {
      cpSync(sourceSkillDir, destSkillDir, { recursive: true });
    }

    if (!needsCursorRules) {
      continue;
    }

    const skillMdPath = join(destSkillDir, "SKILL.md");
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
    const targetMdc = join(projectCursorRulesDir, `${skill.id}.mdc`);
    writeFileSync(targetMdc, `${mdcHeader}${cleanedBody}`, "utf-8");
  }
}
