import { chmodSync, existsSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { inspectFileAccess } from "@/domains/fs/inspect-file-access";
import { FilePermissionError } from "@/errors/file-permission-error";

export type WriteStrategyOutcome = "direct" | "chmod" | "replaced";

export interface WriteOutcome {
  strategy: WriteStrategyOutcome;
  previousOwnerUid: number | null;
}

export interface SafeWriteOptions {
  chmodImpl?: (path: string, mode: number) => void;
}

export function safeWriteFileSync(
  filePath: string,
  content: string,
  options?: SafeWriteOptions
): WriteOutcome {
  const chmodFunction = options?.chmodImpl ?? chmodSync;

  try {
    writeFileSync(filePath, content, "utf-8");
    return { strategy: "direct", previousOwnerUid: null };
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== "EACCES" && nodeError.code !== "EPERM") {
      throw error;
    }
  }

  const diagnosis = inspectFileAccess(filePath);

  if (diagnosis.exists && diagnosis.ownedByCurrentUser && !diagnosis.immutableFlag) {
    try {
      const targetMode = (diagnosis.mode ?? 0o644) | 0o200;
      chmodFunction(filePath, targetMode);
      writeFileSync(filePath, content, "utf-8");
      return { strategy: "chmod", previousOwnerUid: diagnosis.ownerUid };
    } catch {
      // Fall through to atomic replacement strategy
    }
  }

  if (diagnosis.exists && diagnosis.dirWritable && !diagnosis.immutableFlag) {
    const tempPath = `${filePath}.groove-tmp-${process.pid}-${Date.now()}`;
    try {
      const preservedMode = (diagnosis.mode ?? 0o644) | 0o200;
      writeFileSync(tempPath, content, { encoding: "utf-8", mode: preservedMode });
      renameSync(tempPath, filePath);
      return { strategy: "replaced", previousOwnerUid: diagnosis.ownerUid };
    } catch {
      if (existsSync(tempPath)) {
        try {
          rmSync(tempPath, { force: true });
        } catch {
          // Ignore cleanup failure
        }
      }
    }
  }

  throw new FilePermissionError(filePath, diagnosis);
}
