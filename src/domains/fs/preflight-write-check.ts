import { join } from "node:path";
import { inspectFileAccess } from "@/domains/fs/inspect-file-access";
import {
  getProjectConfigPath,
  getProjectMemoryDir,
  getProjectTasksDir,
} from "@/domains/project-store/project-paths";
import { FilePermissionError } from "@/errors/file-permission-error";
import type { AgentId } from "@/types/agent.types";

export interface PreflightCheckOptions {
  targetPath: string;
  selectedAgents: AgentId[];
}

export function canRecoverOrWriteTarget(filePath: string): void {
  const diagnosis = inspectFileAccess(filePath);

  if (diagnosis.immutableFlag) {
    throw new FilePermissionError(filePath, diagnosis);
  }

  if (!diagnosis.exists) {
    if (!diagnosis.dirWritable) {
      throw new FilePermissionError(filePath, diagnosis);
    }
    return;
  }

  const ownerWritable =
    diagnosis.ownedByCurrentUser && ((diagnosis.mode ?? 0) & 0o200) !== 0;

  if (ownerWritable) {
    return;
  }

  if (diagnosis.ownedByCurrentUser) {
    return;
  }

  if (diagnosis.dirWritable) {
    return;
  }

  throw new FilePermissionError(filePath, diagnosis);
}

export function runPreflightWriteCheck(options: PreflightCheckOptions): void {
  const memoryDir = getProjectMemoryDir(options.targetPath);
  const tasksDir = getProjectTasksDir(options.targetPath);

  const candidatePaths: string[] = [
    join(options.targetPath, "AGENTS.md"),
  ];

  if (options.selectedAgents.includes("claude")) {
    candidatePaths.push(join(options.targetPath, "CLAUDE.md"));
  }

  candidatePaths.push(
    getProjectConfigPath(options.targetPath),
    join(memoryDir, "context.md"),
    join(memoryDir, "decisions.md"),
    join(tasksDir, "00-onboarding.md"),
    join(tasksDir, "_template.md")
  );

  for (const filePath of candidatePaths) {
    canRecoverOrWriteTarget(filePath);
  }
}
