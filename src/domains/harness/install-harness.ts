import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getProjectMemoryDir,
  getProjectTasksDir,
} from "@/domains/project-store/project-paths";
import {
  buildContextTemplate,
  buildDecisionsTemplate,
  buildTaskTemplate,
} from "@/domains/harness/harness-templates";
import { upsertAgentInstructions } from "@/domains/harness/upsert-agent-instructions";
import type { HarnessInstallOptions } from "@/types/harness.types";

export function installHarness(options: HarnessInstallOptions): string[] {
  const memoryDir = getProjectMemoryDir(options.targetPath);
  const tasksDir = getProjectTasksDir(options.targetPath);
  const language = options.language ?? "es";

  if (!existsSync(tasksDir)) {
    mkdirSync(tasksDir, { recursive: true });
  }

  const createdFiles: string[] = [];

  const contextPath = join(memoryDir, "context.md");
  if (!existsSync(contextPath)) {
    writeFileSync(contextPath, buildContextTemplate(options.detectedDependencies, language), "utf-8");
    createdFiles.push(contextPath);
  }

  const decisionsPath = join(memoryDir, "decisions.md");
  if (!existsSync(decisionsPath)) {
    writeFileSync(decisionsPath, buildDecisionsTemplate(language), "utf-8");
    createdFiles.push(decisionsPath);
  }

  const templateTaskPath = join(tasksDir, "_template.md");
  if (!existsSync(templateTaskPath)) {
    writeFileSync(templateTaskPath, buildTaskTemplate(), "utf-8");
    createdFiles.push(templateTaskPath);
  }

  const instructions = upsertAgentInstructions(options.targetPath, options.selectedAgents, language);
  createdFiles.push(...instructions);

  return createdFiles;
}
