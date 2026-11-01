import { existsSync } from "node:fs";
import { join } from "node:path";
import { detectAgents } from "@/domains/detector/detect-agents";
import { detectDependencies } from "@/domains/detector/detect-dependencies";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { ProjectContext } from "@/types/context.types";

export function detectProjectContext(targetPath: string): ProjectContext {
  const detectedAgents = detectAgents(targetPath);
  const { dependencies, exists } = detectDependencies(targetPath);

  const suggestedSkillIds: string[] = ["best-practices"];

  for (const skill of SKILL_CATALOG) {
    if (skill.dependencies.length === 0) {
      continue;
    }
    const hasMatch = skill.dependencies.some((dep) => dependencies.includes(dep));
    if (hasMatch && !suggestedSkillIds.includes(skill.id)) {
      suggestedSkillIds.push(skill.id);
    }
  }

  const harnessExists = existsSync(join(targetPath, ".grooveskills", "memory", "context.md"));

  return {
    targetPath,
    detectedDependencies: dependencies,
    suggestedSkillIds,
    detectedAgents,
    packageJsonExists: exists,
    harnessExists,
  };
}
