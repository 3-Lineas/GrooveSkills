import { existsSync, readFileSync } from "node:fs";
import { getProjectConfigPath } from "@/domains/project-store/project-paths";
import { safeWriteFileSync } from "@/domains/fs/safe-file-writer";
import type { InstallTransaction } from "@/domains/fs/install-transaction";
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
  language?: ProjectLanguage,
  transaction?: InstallTransaction,
  skillsToRemove: string[] = []
): string {
  const configPath = getProjectConfigPath(targetPath);
  if (transaction) {
    transaction.recordBeforeWrite(configPath);
  }

  const existing = readExistingConfig(configPath);
  const removalSet = new Set(skillsToRemove);

  const mergedSkills = Array.from(new Set([...existing.skills, ...newSkills])).filter(
    (skillId) => !removalSet.has(skillId)
  );
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

  const outcome = safeWriteFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  if (outcome.strategy === "replaced" && transaction) {
    transaction.recordReplacedFile(configPath, outcome.previousOwnerUid);
  }

  return configPath;
}
