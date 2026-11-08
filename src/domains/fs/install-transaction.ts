import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { safeWriteFileSync } from "@/domains/fs/safe-file-writer";

export interface RollbackFailure {
  path: string;
  reason: string;
}

export interface ReplacedFileNotice {
  filePath: string;
  previousOwnerUid: number | null;
}

export interface RollbackReport {
  restoredFiles: string[];
  removedFiles: string[];
  removedDirs: string[];
  removedSymlinks: string[];
  failures: RollbackFailure[];
  isClean: boolean;
}

export class InstallTransaction {
  private originalFiles = new Map<string, string | null>();
  private createdDirs: string[] = [];
  private createdSymlinks: string[] = [];
  private replacedFiles: ReplacedFileNotice[] = [];

  recordBeforeWrite(filePath: string): void {
    if (this.originalFiles.has(filePath)) {
      return;
    }
    if (existsSync(filePath)) {
      try {
        this.originalFiles.set(filePath, readFileSync(filePath, "utf-8"));
      } catch {
        this.originalFiles.set(filePath, null);
      }
    } else {
      this.originalFiles.set(filePath, null);
    }
  }

  recordCreatedDir(dirPath: string): void {
    if (!existsSync(dirPath) && !this.createdDirs.includes(dirPath)) {
      this.createdDirs.push(dirPath);
    }
  }

  recordCreatedSymlink(symlinkPath: string): void {
    if (!this.createdSymlinks.includes(symlinkPath)) {
      this.createdSymlinks.push(symlinkPath);
    }
  }

  recordReplacedFile(filePath: string, previousOwnerUid: number | null): void {
    if (!this.replacedFiles.some((item) => item.filePath === filePath)) {
      this.replacedFiles.push({ filePath, previousOwnerUid });
    }
  }

  getReplacedFiles(): ReplacedFileNotice[] {
    return [...this.replacedFiles];
  }

  rollback(): RollbackReport {
    const restoredFiles: string[] = [];
    const removedFiles: string[] = [];
    const removedDirs: string[] = [];
    const removedSymlinks: string[] = [];
    const failures: RollbackFailure[] = [];

    for (const symlinkPath of this.createdSymlinks) {
      try {
        rmSync(symlinkPath, { force: true, recursive: true });
        removedSymlinks.push(symlinkPath);
      } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : String(error);
        failures.push({ path: symlinkPath, reason });
      }
    }

    for (const [filePath, content] of this.originalFiles.entries()) {
      try {
        if (content === null) {
          if (existsSync(filePath)) {
            rmSync(filePath, { force: true });
            removedFiles.push(filePath);
          }
          continue;
        }

        if (existsSync(filePath)) {
          try {
            const currentContent = readFileSync(filePath, "utf-8");
            if (currentContent === content) {
              continue;
            }
          } catch {
            // Proceed to restore if current content cannot be read
          }
        }

        safeWriteFileSync(filePath, content);
        restoredFiles.push(filePath);
      } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : String(error);
        failures.push({ path: filePath, reason });
      }
    }

    const sortedDirs = [...this.createdDirs].sort(
      (firstDir, secondDir) => secondDir.length - firstDir.length
    );
    for (const directoryPath of sortedDirs) {
      try {
        if (existsSync(directoryPath) && readdirSync(directoryPath).length === 0) {
          rmSync(directoryPath, { recursive: true, force: true });
          removedDirs.push(directoryPath);
        }
      } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : String(error);
        failures.push({ path: directoryPath, reason });
      }
    }

    return {
      restoredFiles,
      removedFiles,
      removedDirs,
      removedSymlinks,
      failures,
      isClean: failures.length === 0,
    };
  }
}
