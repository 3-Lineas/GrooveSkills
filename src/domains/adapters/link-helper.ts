import { lstatSync, unlinkSync, rmSync, symlinkSync } from "node:fs";
import { dirname, relative } from "node:path";

function removeExistingLinkPath(path: string): void {
  try {
    const lstat = lstatSync(path);

    if (lstat.isDirectory() && !lstat.isSymbolicLink()) {
      rmSync(path, { recursive: true, force: true });
      return;
    }

    unlinkSync(path);
  } catch {
    // If path does not exist, exit early
  }
}

export function createOrReplaceSymlink(
  target: string,
  linkPath: string,
  type: "dir" | "file"
): void {
  removeExistingLinkPath(linkPath);

  const linkDir = dirname(linkPath);
  const relativeTarget = relative(linkDir, target);

  symlinkSync(relativeTarget, linkPath, type);
}
