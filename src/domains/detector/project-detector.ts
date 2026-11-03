import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { detectAgents } from "@/domains/detector/detect-agents";
import { detectDependencies } from "@/domains/detector/detect-dependencies";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { ProjectContext } from "@/types/context.types";
import type { GrooveSkillsConfig, ProjectLanguage } from "@/types/harness.types";

function readConfiguredLanguage(targetPath: string): ProjectLanguage | undefined {
  const configPath = join(targetPath, ".grooveskills", "config.json");
  if (!existsSync(configPath)) {
    return undefined;
  }

  try {
    const raw = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<GrooveSkillsConfig>;
    return typeof parsed.language === "string" ? (parsed.language as ProjectLanguage) : undefined;
  } catch {
    return undefined;
  }
}

export function detectProjectContext(targetPath: string): ProjectContext {
  const detectedAgents = detectAgents(targetPath);
  const { dependencies, exists } = detectDependencies(targetPath);

  const suggestedSkillIds: string[] = [
    "odd-ai",
    "best-practices",
    "ux-writing",
    "docs-standards",
    "error-handling-logging",
    "clean-architecture-ddd",
    "external-service-adapters",
    "storage-file-adapters",
    "auth-rbac-policies",
    "controller-orchestration-queues",
    "webhook-idempotency",
    "caching-rate-limiting",
    "env-feature-flags",
  ];

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
  const configuredLanguage = readConfiguredLanguage(targetPath);

  return {
    targetPath,
    detectedDependencies: dependencies,
    suggestedSkillIds,
    detectedAgents,
    packageJsonExists: exists,
    harnessExists,
    configuredLanguage,
  };
}
