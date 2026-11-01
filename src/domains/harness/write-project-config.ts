import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { getProjectConfigPath } from "@/domains/project-store/project-paths";
import type { GrooveSkillsConfig } from "@/types/harness.types";
import type { AgentId } from "@/types/agent.types";

export function writeProjectConfig(
  targetPath: string,
  newSkills: string[],
  newAgents: AgentId[],
  harnessEnabled: boolean
): string {
  const configPath = getProjectConfigPath(targetPath);

  let existingSkills: string[] = [];
  let existingAgents: AgentId[] = [];
  let existingHarness = false;

  if (existsSync(configPath)) {
    try {
      const parsed = JSON.parse(readFileSync(configPath, "utf-8")) as Partial<GrooveSkillsConfig>;
      if (Array.isArray(parsed.skills)) {
        existingSkills = parsed.skills;
      }
      if (Array.isArray(parsed.agents)) {
        existingAgents = parsed.agents;
      }
      if (typeof parsed.harness === "boolean") {
        existingHarness = parsed.harness;
      }
    } catch {
      // If parsing fails, fall back to initial state
    }
  }

  const mergedSkills = Array.from(new Set([...existingSkills, ...newSkills]));
  const mergedAgents = Array.from(new Set([...existingAgents, ...newAgents]));

  const config: GrooveSkillsConfig = {
    version: 1,
    harness: existingHarness || harnessEnabled,
    agents: mergedAgents,
    skills: mergedSkills,
    updatedAt: new Date().toISOString(),
  };

  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf-8");

  return configPath;
}
