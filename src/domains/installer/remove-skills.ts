import { existsSync, lstatSync, rmSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

function removeLocationIfExists(targetPath: string): void {
  if (!existsSync(targetPath)) {
    try {
      const stat = lstatSync(targetPath);
      if (stat.isSymbolicLink()) {
        unlinkSync(targetPath);
      }
    } catch {
      // Ignored if it does not exist
    }
    return;
  }

  try {
    const stat = lstatSync(targetPath);
    if (stat.isSymbolicLink()) {
      unlinkSync(targetPath);
      return;
    }

    if (stat.isDirectory()) {
      rmSync(targetPath, { recursive: true, force: true });
      return;
    }

    unlinkSync(targetPath);
  } catch {
    // Graceful error handling for missing files
  }
}

export function removeSkillsFromProject(
  targetPath: string,
  skillIdsToRemove: string[]
): string[] {
  const processedSkillIds: string[] = [];

  for (const skillId of skillIdsToRemove) {
    const skill = SKILL_CATALOG.find((item) => item.id === skillId);
    if (!skill || skill.isCoreHarness) {
      continue;
    }

    const locationsToRemove = [
      join(targetPath, ".grooveskills", "skills", skill.directoryName),
      join(targetPath, ".agents", "skills", skill.directoryName),
      join(targetPath, ".claude", "skills", skill.directoryName),
      join(targetPath, ".gemini", "skills", skill.directoryName),
      join(targetPath, ".cursor", "rules", `${skill.id}.mdc`),
      join(targetPath, ".cursor", "rules", `${skill.directoryName}.mdc`),
    ];

    for (const locationPath of locationsToRemove) {
      removeLocationIfExists(locationPath);
    }

    processedSkillIds.push(skill.id);
  }

  return processedSkillIds;
}
