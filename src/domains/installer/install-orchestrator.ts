import { join } from "node:path";
import { AntigravityAdapter } from "@/domains/adapters/antigravity.adapter";
import { ClaudeAdapter } from "@/domains/adapters/claude.adapter";
import { CursorAdapter } from "@/domains/adapters/cursor.adapter";
import { GeminiAdapter } from "@/domains/adapters/gemini.adapter";
import { syncProjectStore } from "@/domains/project-store/sync-project-store";
import { getProjectSkillsDir } from "@/domains/project-store/project-paths";
import { installHarness } from "@/domains/harness/install-harness";
import { writeProjectConfig } from "@/domains/harness/write-project-config";
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
  const skillsToInstall = [...options.selectedSkillIds];

  if (options.enableHarness && !skillsToInstall.includes("groove-harness")) {
    skillsToInstall.push("groove-harness");
  }

  syncProjectStore(options.targetPath, skillsToInstall, options.selectedAgents);

  const projectSkillsDir = getProjectSkillsDir(options.targetPath);
  const createdFiles: string[] = [];

  for (const skillId of skillsToInstall) {
    const skill = SKILL_CATALOG.find((item) => item.id === skillId);
    if (!skill) {
      continue;
    }

    const skillSourceDir = join(projectSkillsDir, skill.directoryName);

    for (const agentId of options.selectedAgents) {
      const adapter = ADAPTER_REGISTRY[agentId];
      if (!adapter) {
        continue;
      }

      const files = await adapter.installSkill(options.targetPath, skill, skillSourceDir);
      createdFiles.push(...files);
    }
  }

  let harnessInitialized = false;
  if (options.enableHarness) {
    const harnessFiles = installHarness({
      targetPath: options.targetPath,
      selectedAgents: options.selectedAgents,
      selectedSkillIds: skillsToInstall,
      detectedDependencies: options.detectedDependencies || [],
    });
    createdFiles.push(...harnessFiles);
    harnessInitialized = true;
  }

  const configPath = writeProjectConfig(
    options.targetPath,
    skillsToInstall,
    options.selectedAgents,
    Boolean(options.enableHarness)
  );
  createdFiles.push(configPath);

  return {
    installedSkills: skillsToInstall,
    configuredAgents: options.selectedAgents,
    createdFiles,
    harnessInitialized,
  };
}
