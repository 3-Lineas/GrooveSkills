import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { getProjectConfigPath } from "@/domains/project-store/project-paths";
import type { GrooveSkillsConfig, ProjectLanguage } from "@/types/harness.types";
import type { AgentId } from "@/types/agent.types";

interface ParsedConfigState {
  skills: string[];
  agents: AgentId[];
  harness: boolean;
  language?: ProjectLanguage;
}

function readExistingConfig(configPath: string): ParsedConfigState {
  const fallback: ParsedConfigState = {
    skills: [],
    agents: [],
    harness: false,
  };

  if (!existsSync(configPath)) {
    return fallback;
  }

  try {
    const raw = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<GrooveSkillsConfig>;

    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      agents: Array.isArray(parsed.agents) ? parsed.agents : [],
      harness: typeof parsed.harness === "boolean" ? parsed.harness : false,
      language: typeof parsed.language === "string" ? (parsed.language as ProjectLanguage) : undefined,
    };
  } catch {
    return fallback;
  }
}

export function writeProjectConfig(
  targetPath: string,
  newSkills: string[],
  newAgents: AgentId[],
  harnessEnabled: boolean,
  language?: ProjectLanguage
): string {
  const configPath = getProjectConfigPath(targetPath);
  const existing = readExistingConfig(configPath);

  const mergedSkills = Array.from(new Set([...existing.skills, ...newSkills]));
  const mergedAgents = Array.from(new Set([...existing.agents, ...newAgents]));
  const resolvedLanguage = language ?? existing.language ?? "es";
  const isHarnessActive = existing.harness || harnessEnabled;

  const config: GrooveSkillsConfig = {
    version: 1,
    harness: isHarnessActive,
    ...(isHarnessActive ? { language: resolvedLanguage } : {}),
    agents: mergedAgents,
    skills: mergedSkills,
    updatedAt: new Date().toISOString(),
  };

  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf-8");

  return configPath;
}
