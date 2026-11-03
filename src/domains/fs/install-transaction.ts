import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { safeWriteFileSync } from "@/domains/fs/safe-file-writer";

export interface RollbackReport {
  restoredFiles: string[];
  removedFiles: string[];
  removedDirs: string[];
}

export class InstallTransaction {
  private originalFiles = new Map<string, string | null>();
  private createdDirs: string[] = [];

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

  rollback(): RollbackReport {
    const restoredFiles: string[] = [];
    const removedFiles: string[] = [];
    const removedDirs: string[] = [];

    for (const [filePath, content] of this.originalFiles.entries()) {
      try {
        if (content === null) {
          if (existsSync(filePath)) {
            rmSync(filePath, { force: true });
            removedFiles.push(filePath);
          }
        } else {
          safeWriteFileSync(filePath, content);
          restoredFiles.push(filePath);
        }
      } catch {
        // Ignorar fallos individuales para maximizar la restauración del resto
      }
    }

    const sortedDirs = [...this.createdDirs].sort((a, b) => b.length - a.length);
    for (const dir of sortedDirs) {
      try {
        if (existsSync(dir) && readdirSync(dir).length === 0) {
          rmSync(dir, { recursive: true, force: true });
          removedDirs.push(dir);
        }
      } catch {
        // Ignorar si no se puede eliminar
      }
    }

    return { restoredFiles, removedFiles, removedDirs };
  }
}
