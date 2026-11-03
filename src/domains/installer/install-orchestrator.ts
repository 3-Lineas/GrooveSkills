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
import { InstallTransaction } from "@/domains/fs/install-transaction";
import { runPreflightWriteCheck } from "@/domains/fs/preflight-write-check";
import { InstallTransactionError } from "@/errors/install-transaction-error";
import { FilePermissionError } from "@/errors/file-permission-error";
import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import type { InstallOptions, InstallResult } from "@/types/installer.types";
import type { AgentId } from "@/types/agent.types";

const ADAPTER_REGISTRY: Record<AgentId, AgentAdapter> = {
  antigravity: new AntigravityAdapter(),
  claude: new ClaudeAdapter(),
  cursor: new CursorAdapter(),
  gemini: new GeminiAdapter(),
};

function formatSuggestedFix(cause: unknown): string | undefined {
  if (cause instanceof FilePermissionError) {
    return cause.suggestedFixCommand;
  }
  const nodeError = cause as NodeJS.ErrnoException;
  if (nodeError?.code === "EACCES" || nodeError?.code === "EPERM") {
    if (nodeError.path) {
      return `chmod u+w "${nodeError.path}"`;
    }
  }
  return undefined;
}

export async function installSkills(options: InstallOptions): Promise<InstallResult> {
  const transaction = new InstallTransaction();
  const skillsToInstall = [...options.selectedSkillIds];

  if (!skillsToInstall.includes("groove-harness")) {
    skillsToInstall.push("groove-harness");
  }

  if (!skillsToInstall.includes("odd-ai")) {
    skillsToInstall.push("odd-ai");
  }

  let currentStage = "Preflight check";
  try {
    runPreflightWriteCheck({
      targetPath: options.targetPath,
      selectedAgents: options.selectedAgents,
    });

    currentStage = "Syncing skills store (.grooveskills/skills)";
    syncProjectStore(options.targetPath, skillsToInstall, options.selectedAgents, transaction);

    const projectSkillsDir = getProjectSkillsDir(options.targetPath);
    const createdFiles: string[] = [];

    currentStage = "Configuring agent references (.agents, .claude, etc.)";
    for (const skillId of skillsToInstall) {
      const skill = SKILL_CATALOG.find((catalogItem) => catalogItem.id === skillId);
      if (!skill) {
        continue;
      }

      const skillSourceDir = join(projectSkillsDir, skill.directoryName);

      for (const agentId of options.selectedAgents) {
        const adapter = ADAPTER_REGISTRY[agentId];
        if (!adapter) {
          continue;
        }

        const files = await adapter.installSkill(
          options.targetPath,
          skill,
          skillSourceDir,
          transaction
        );
        createdFiles.push(...files);
      }
    }

    currentStage = "Installing Groove Harness (context, decisions, tasks, and instructions)";
    const harnessResult = installHarness({
      targetPath: options.targetPath,
      selectedAgents: options.selectedAgents,
      selectedSkillIds: skillsToInstall,
      detectedDependencies: options.detectedDependencies || [],
      language: options.language,
      forceOnboarding: options.forceOnboarding,
      transaction,
    });
    createdFiles.push(...harnessResult.createdFiles);

    currentStage = "Persisting project configuration (.grooveskills/config.json)";
    const configPath = writeProjectConfig(
      options.targetPath,
      skillsToInstall,
      options.selectedAgents,
      true,
      options.language,
      transaction
    );
    createdFiles.push(configPath);

    return {
      installedSkills: skillsToInstall,
      configuredAgents: options.selectedAgents,
      createdFiles,
      harnessInitialized: harnessResult.onboardingInitialized,
      language: options.language,
      replacedFiles: transaction.getReplacedFiles(),
    };
  } catch (cause) {
    const rollbackReport = transaction.rollback();
    const suggestedFix = formatSuggestedFix(cause);
    throw new InstallTransactionError({
      stage: currentStage,
      cause,
      rollbackReport,
      suggestedFix,
    });
  }
}
