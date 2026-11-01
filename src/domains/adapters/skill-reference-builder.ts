import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getProjectSkillsDir } from "@/domains/project-store/project-paths";
import type { SkillMetadata } from "@/types/skill.types";

function removeExistingPathSafely(path: string): void {
  const fileExists = existsSync(path);

  if (!fileExists) {
    try {
      const lstat = lstatSync(path);
      if (lstat.isSymbolicLink()) {
        unlinkSync(path);
      }
    } catch {
      // Ignored if file really does not exist
    }
    return;
  }

  try {
    const lstat = lstatSync(path);
    if (lstat.isSymbolicLink()) {
      unlinkSync(path);
      return;
    }

    if (lstat.isDirectory()) {
      rmSync(path, { recursive: true, force: true });
      return;
    }

    unlinkSync(path);
  } catch {
    // Graceful fallback
  }
}

function extractSkillDescription(canonicalSkillMdPath: string, fallback: string): string {
  if (!existsSync(canonicalSkillMdPath)) {
    return fallback;
  }

  try {
    const content = readFileSync(canonicalSkillMdPath, "utf-8");
    const match = content.match(/^description:\s*(.+)$/m);
    const hasMatchedDesc = Boolean(match && match[1]);
    if (hasMatchedDesc && match?.[1]) {
      return match[1].trim();
    }
  } catch {
    // Use fallback on error
  }

  return fallback;
}

export function writeAgentSkillReference(
  targetPath: string,
  agentRelativeSkillsDir: string,
  skill: SkillMetadata
): string {
  const agentSkillFolder = join(targetPath, agentRelativeSkillsDir, skill.directoryName);
  removeExistingPathSafely(agentSkillFolder);

  mkdirSync(agentSkillFolder, { recursive: true });

  const canonicalSkillMd = join(getProjectSkillsDir(targetPath), skill.directoryName, "SKILL.md");
  const description = extractSkillDescription(canonicalSkillMd, skill.description);

  const referenceContent = `---
name: ${skill.id}
description: ${description}
---

# ${skill.name} — Skill Reference

Canonical skill specification stored in \`.grooveskills/\`.

- **Specification**: [\`.grooveskills/skills/${skill.directoryName}/SKILL.md\`](../../../.grooveskills/skills/${skill.directoryName}/SKILL.md)
- **References & Templates**: \`.grooveskills/skills/${skill.directoryName}/\`

> **Instruction**: Read \`.grooveskills/skills/${skill.directoryName}/SKILL.md\` before executing tasks matching this skill.
`;

  const targetFile = join(agentSkillFolder, "SKILL.md");
  writeFileSync(targetFile, referenceContent, "utf-8");

  return targetFile;
}

export function writeCursorRuleReference(
  targetPath: string,
  cursorRelativeRulesDir: string,
  skill: SkillMetadata
): string {
  const rulesDir = join(targetPath, cursorRelativeRulesDir);
  if (!existsSync(rulesDir)) {
    mkdirSync(rulesDir, { recursive: true });
  }

  const targetFile = join(rulesDir, `${skill.id}.mdc`);
  removeExistingPathSafely(targetFile);

  const canonicalSkillMd = join(getProjectSkillsDir(targetPath), skill.directoryName, "SKILL.md");
  const description = extractSkillDescription(canonicalSkillMd, skill.description);

  const referenceContent = `---
description: ${description}
globs: ["**/*"]
alwaysApply: false
---

# ${skill.name} — Rule Reference

Canonical rule specification stored in \`.grooveskills/\`.

- **Specification**: \`.grooveskills/skills/${skill.directoryName}/SKILL.md\`
- **References & Templates**: \`.grooveskills/skills/${skill.directoryName}/\`

> **Instruction**: Read \`.grooveskills/skills/${skill.directoryName}/SKILL.md\` before executing tasks matching this rule.
`;

  writeFileSync(targetFile, referenceContent, "utf-8");

  return targetFile;
}
