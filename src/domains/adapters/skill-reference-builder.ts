import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, symlinkSync, unlinkSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";
import { getProjectSkillsDir } from "@/domains/project-store/project-paths";
import { safeWriteFileSync } from "@/domains/fs/safe-file-writer";
import type { InstallTransaction } from "@/domains/fs/install-transaction";
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

export function linkAgentSkill(
  targetPath: string,
  agentRelativeSkillsDir: string,
  skill: SkillMetadata,
  transaction?: InstallTransaction
): string {
  const agentSkillsDir = join(targetPath, agentRelativeSkillsDir);
  const linkPath = join(agentSkillsDir, skill.directoryName);
  const canonicalSkillDir = join(getProjectSkillsDir(targetPath), skill.directoryName);

  if (transaction) {
    transaction.recordCreatedDir(agentSkillsDir);
    transaction.recordCreatedSymlink(linkPath);
  }

  if (!existsSync(agentSkillsDir)) {
    mkdirSync(agentSkillsDir, { recursive: true });
  }

  removeExistingPathSafely(linkPath);

  const relativeTargetPath = relative(agentSkillsDir, canonicalSkillDir)
    .split(sep)
    .join(posix.sep);

  symlinkSync(relativeTargetPath, linkPath, "junction");

  return linkPath;
}

export function writeCursorRuleReference(
  targetPath: string,
  cursorRelativeRulesDir: string,
  skill: SkillMetadata,
  transaction?: InstallTransaction
): string {
  const rulesDir = join(targetPath, cursorRelativeRulesDir);
  const targetFile = join(rulesDir, `${skill.id}.mdc`);
  if (transaction) {
    transaction.recordCreatedDir(rulesDir);
    transaction.recordBeforeWrite(targetFile);
  }
  if (!existsSync(rulesDir)) {
    mkdirSync(rulesDir, { recursive: true });
  }

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

  safeWriteFileSync(targetFile, referenceContent);

  return targetFile;
}
