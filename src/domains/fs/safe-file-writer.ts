import { chmodSync, existsSync, writeFileSync } from "node:fs";
import { FilePermissionError } from "@/errors/file-permission-error";

export function safeWriteFileSync(filePath: string, content: string): void {
  try {
    writeFileSync(filePath, content, "utf-8");
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "EACCES" || err.code === "EPERM") {
      if (existsSync(filePath)) {
        try {
          chmodSync(filePath, 0o644);
          writeFileSync(filePath, content, "utf-8");
          return;
        } catch {
          // Si chmod falla, lanzamos FilePermissionError abajo
        }
      }
      throw new FilePermissionError(filePath);
    }
    throw error;
  }
}
