import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { detectAgents } from "@/domains/detector/detect-agents";
import { detectDependencies } from "@/domains/detector/detect-dependencies";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { AgentId } from "@/types/agent.types";
import type { ProjectContext } from "@/types/context.types";
import type { GrooveSkillsConfig, ProjectLanguage } from "@/types/harness.types";

function readConfiguredState(targetPath: string): {
  language?: ProjectLanguage;
  agents?: AgentId[];
  skills?: string[];
} {
  const configPath = join(targetPath, ".grooveskills", "config.json");
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const raw = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<GrooveSkillsConfig>;
    const language =
      typeof parsed.language === "string" ? (parsed.language as ProjectLanguage) : undefined;
    const agents = Array.isArray(parsed.agents) ? (parsed.agents as AgentId[]) : undefined;
    const skills = Array.isArray(parsed.skills) ? (parsed.skills as string[]) : undefined;
    return { language, agents, skills };
  } catch {
    return {};
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
    "security-audit",
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
    const hasMatch = skill.dependencies.some((dependencyName) =>
      dependencies.includes(dependencyName)
    );
    if (hasMatch && !suggestedSkillIds.includes(skill.id)) {
      suggestedSkillIds.push(skill.id);
    }
  }

  const harnessExists = existsSync(join(targetPath, ".grooveskills", "memory", "context.md"));
  const configuredState = readConfiguredState(targetPath);

  const initialAgents =
    configuredState.agents && configuredState.agents.length > 0
      ? Array.from(new Set([...detectedAgents, ...configuredState.agents]))
      : detectedAgents;

  const mergedSuggestedSkills =
    configuredState.skills && configuredState.skills.length > 0
      ? Array.from(new Set([...suggestedSkillIds, ...configuredState.skills]))
      : suggestedSkillIds;

  return {
    targetPath,
    detectedDependencies: dependencies,
    suggestedSkillIds: mergedSuggestedSkills,
    detectedAgents: initialAgents,
    packageJsonExists: exists,
    harnessExists,
    configuredLanguage: configuredState.language,
    configuredSkills: configuredState.skills,
    configuredAgents: configuredState.agents,
  };
}
