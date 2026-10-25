import { join } from "node:path";
import { AntigravityAdapter } from "@/domains/adapters/antigravity.adapter";
import { ClaudeAdapter } from "@/domains/adapters/claude.adapter";
import { CursorAdapter } from "@/domains/adapters/cursor.adapter";
import { GeminiAdapter } from "@/domains/adapters/gemini.adapter";
import { syncGlobalStore } from "@/domains/global-store/sync-global-store";
import { getGlobalSkillsDir } from "@/domains/global-store/global-paths";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import type { InstallOptions, InstallResult } from "@/types/installer.types";
import type { AgentId } from "@/types/agent.types";

const ADAPTER_REGISTRY: Record<AgentId, AgentAdapter> = {
  antigravity: new AntigravityAdapter(),
  claude: new ClaudeAdapter(),
  cursor: new CursorAdapter(),
  gemini: new GeminiAdapter(),
};

export async function installSkills(options: InstallOptions): Promise<InstallResult> {
  syncGlobalStore();

  const globalSkillsDir = getGlobalSkillsDir();
  const createdFiles: string[] = [];

  for (const skillId of options.selectedSkillIds) {
    const skill = SKILL_CATALOG.find((item) => item.id === skillId);
    if (!skill) {
      continue;
    }

    const skillSourceDir = join(globalSkillsDir, skill.directoryName);

    for (const agentId of options.selectedAgents) {
      const adapter = ADAPTER_REGISTRY[agentId];
      if (!adapter) {
        continue;
      }

      const files = await adapter.installSkill(options.targetPath, skill, skillSourceDir);
      createdFiles.push(...files);
    }
  }

  return {
    installedSkills: options.selectedSkillIds,
    configuredAgents: options.selectedAgents,
    createdFiles,
  };
}
