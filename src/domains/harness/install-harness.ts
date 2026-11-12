import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  getProjectBitacoraDir,
  getProjectMemoryDir,
  getProjectTasksDir,
} from "@/domains/project-store/project-paths";
import { getProjectVersionsPath } from "@/domains/project-store/get-project-versions-path";
import {
  buildContextTemplate,
  buildDecisionsTemplate,
  buildOnboardingTaskTemplate,
  buildTaskTemplate,
} from "@/domains/harness/harness-templates";
import { buildVersionsTemplate } from "@/domains/harness/build-versions-template";
import { scanProjectOnboarding } from "@/domains/harness/scan-project-onboarding";
import { normalizeTaskFileNames } from "@/domains/harness/normalize-task-filenames";
import { upsertAgentInstructions } from "@/domains/harness/upsert-agent-instructions";
import { safeWriteFileSync } from "@/domains/fs/safe-file-writer";
import type { InstallTransaction } from "@/domains/fs/install-transaction";
import type {
  HarnessInstallOptions,
  HarnessInstallResult,
} from "@/types/harness.types";

function writeTrackedFile(
  filePath: string,
  content: string,
  transaction?: InstallTransaction
): void {
  if (transaction) {
    transaction.recordBeforeWrite(filePath);
  }
  const outcome = safeWriteFileSync(filePath, content);
  if (outcome.strategy === "replaced" && transaction) {
    transaction.recordReplacedFile(filePath, outcome.previousOwnerUid);
  }
}

export function installHarness(options: HarnessInstallOptions): HarnessInstallResult {
  const memoryDir = getProjectMemoryDir(options.targetPath);
  const tasksDir = getProjectTasksDir(options.targetPath);
  const bitacoraDir = getProjectBitacoraDir(options.targetPath);
  const language = options.language ?? "es";
  const forceOnboarding = Boolean(options.forceOnboarding);
  const transaction = options.transaction;

  if (transaction) {
    transaction.recordCreatedDir(memoryDir);
    transaction.recordCreatedDir(tasksDir);
    transaction.recordCreatedDir(bitacoraDir);
  }

  if (!existsSync(tasksDir)) {
    mkdirSync(tasksDir, { recursive: true });
  }

  if (!existsSync(bitacoraDir)) {
    mkdirSync(bitacoraDir, { recursive: true });
  }

  const createdFiles: string[] = [];

  const versionsPath = getProjectVersionsPath(options.targetPath);
  writeTrackedFile(versionsPath, buildVersionsTemplate(), transaction);
  createdFiles.push(versionsPath);

  const contextPath = join(memoryDir, "context.md");
  const shouldWriteContext = !existsSync(contextPath) || forceOnboarding;

  if (shouldWriteContext) {
    const profile = scanProjectOnboarding(options.targetPath);
    const contextContent = buildContextTemplate(
      options.detectedDependencies,
      language,
      profile
    );
    writeTrackedFile(contextPath, contextContent, transaction);
    createdFiles.push(contextPath);

    const onboardingTaskPath = join(tasksDir, "00-onboarding.md");
    writeTrackedFile(
      onboardingTaskPath,
      buildOnboardingTaskTemplate(profile.projectName),
      transaction
    );
    createdFiles.push(onboardingTaskPath);
  }

  const decisionsPath = join(memoryDir, "decisions.md");
  if (!existsSync(decisionsPath)) {
    writeTrackedFile(decisionsPath, buildDecisionsTemplate(language), transaction);
    createdFiles.push(decisionsPath);
  }

  const templateTaskPath = join(tasksDir, "_template.md");
  if (!existsSync(templateTaskPath)) {
    writeTrackedFile(templateTaskPath, buildTaskTemplate(), transaction);
    createdFiles.push(templateTaskPath);
  }

  normalizeTaskFileNames(tasksDir, transaction);

  const instructions = upsertAgentInstructions(
    options.targetPath,
    options.selectedAgents,
    language,
    transaction
  );
  createdFiles.push(...instructions);

  return {
    createdFiles,
    onboardingInitialized: shouldWriteContext,
  };
}
