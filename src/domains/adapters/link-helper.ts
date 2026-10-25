import { lstatSync, unlinkSync, rmSync, symlinkSync } from "node:fs";

export function createOrReplaceSymlink(
  target: string,
  linkPath: string,
  type: "dir" | "file"
): void {
  try {
    const lstat = lstatSync(linkPath);
    if (lstat.isSymbolicLink()) {
      unlinkSync(linkPath);
    } else if (lstat.isDirectory()) {
      rmSync(linkPath, { recursive: true, force: true });
    } else {
      unlinkSync(linkPath);
    }
  } catch {
    // If linkPath does not exist, safe to proceed
  }

  symlinkSync(target, linkPath, type);
}
