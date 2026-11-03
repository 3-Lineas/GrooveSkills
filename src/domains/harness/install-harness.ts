import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  getProjectMemoryDir,
  getProjectTasksDir,
} from "@/domains/project-store/project-paths";
import {
  buildContextTemplate,
  buildDecisionsTemplate,
  buildOnboardingTaskTemplate,
  buildTaskTemplate,
} from "@/domains/harness/harness-templates";
import { scanProjectOnboarding } from "@/domains/harness/scan-project-onboarding";
import { upsertAgentInstructions } from "@/domains/harness/upsert-agent-instructions";
import { safeWriteFileSync } from "@/domains/fs/safe-file-writer";
import type {
  HarnessInstallOptions,
  HarnessInstallResult,
} from "@/types/harness.types";

export function installHarness(options: HarnessInstallOptions): HarnessInstallResult {
  const memoryDir = getProjectMemoryDir(options.targetPath);
  const tasksDir = getProjectTasksDir(options.targetPath);
  const language = options.language ?? "es";
  const forceOnboarding = Boolean(options.forceOnboarding);
  const tx = options.transaction;

  if (tx) {
    tx.recordCreatedDir(memoryDir);
    tx.recordCreatedDir(tasksDir);
  }

  if (!existsSync(tasksDir)) {
    mkdirSync(tasksDir, { recursive: true });
  }

  const createdFiles: string[] = [];
  const contextPath = join(memoryDir, "context.md");
  const shouldWriteContext = !existsSync(contextPath) || forceOnboarding;

  if (shouldWriteContext) {
    if (tx) {
      tx.recordBeforeWrite(contextPath);
    }
    const profile = scanProjectOnboarding(options.targetPath);
    const contextContent = buildContextTemplate(
      options.detectedDependencies,
      language,
      profile
    );
    safeWriteFileSync(contextPath, contextContent);
    createdFiles.push(contextPath);

    const onboardingTaskPath = join(tasksDir, "00-onboarding.md");
    if (tx) {
      tx.recordBeforeWrite(onboardingTaskPath);
    }
    safeWriteFileSync(
      onboardingTaskPath,
      buildOnboardingTaskTemplate(profile.projectName)
    );
    createdFiles.push(onboardingTaskPath);
  }

  const decisionsPath = join(memoryDir, "decisions.md");
  if (!existsSync(decisionsPath)) {
    if (tx) {
      tx.recordBeforeWrite(decisionsPath);
    }
    safeWriteFileSync(decisionsPath, buildDecisionsTemplate(language));
    createdFiles.push(decisionsPath);
  }

  const templateTaskPath = join(tasksDir, "_template.md");
  if (!existsSync(templateTaskPath)) {
    if (tx) {
      tx.recordBeforeWrite(templateTaskPath);
    }
    safeWriteFileSync(templateTaskPath, buildTaskTemplate());
    createdFiles.push(templateTaskPath);
  }

  const instructions = upsertAgentInstructions(
    options.targetPath,
    options.selectedAgents,
    language,
    tx
  );
  createdFiles.push(...instructions);

  return {
    createdFiles,
    onboardingInitialized: shouldWriteContext,
  };
}
