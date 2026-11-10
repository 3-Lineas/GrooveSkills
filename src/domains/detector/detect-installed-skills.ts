import { existsSync, lstatSync } from "node:fs";
import { join } from "node:path";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

function pathExistsOrSymlink(candidatePath: string): boolean {
  if (existsSync(candidatePath)) {
    return true;
  }
  try {
    const stat = lstatSync(candidatePath);
    return stat.isSymbolicLink();
  } catch {
    return false;
  }
}

export function detectInstalledSkills(
  targetPath: string,
  configuredSkills?: string[]
): string[] {
  const installedSet = new Set<string>();

  const configuredSet = new Set(configuredSkills ?? []);

  for (const skill of SKILL_CATALOG) {
    if (skill.isCoreHarness) {
      continue;
    }

    if (configuredSet.has(skill.id)) {
      installedSet.add(skill.id);
      continue;
    }

    const checkLocations = [
      join(targetPath, ".grooveskills", "skills", skill.directoryName),
      join(targetPath, ".agents", "skills", skill.directoryName),
      join(targetPath, ".claude", "skills", skill.directoryName),
      join(targetPath, ".gemini", "skills", skill.directoryName),
      join(targetPath, ".cursor", "rules", `${skill.id}.mdc`),
      join(targetPath, ".cursor", "rules", `${skill.directoryName}.mdc`),
    ];

    const isInstalledOnDisk = checkLocations.some((locationPath) =>
      pathExistsOrSymlink(locationPath)
    );

    if (isInstalledOnDisk) {
      installedSet.add(skill.id);
    }
  }

  return Array.from(installedSet);
}
