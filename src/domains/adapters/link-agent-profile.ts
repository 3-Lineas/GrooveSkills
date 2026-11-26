import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { join, relative, dirname } from "node:path";
import { getProjectAgentsDir } from "@/domains/project-store/project-paths";
import type { InstallTransaction } from "@/domains/fs/install-transaction";

export function linkAgentProfile(
  targetPath: string,
  agentSubdir: string,
  fileName: string,
  transaction?: InstallTransaction
): string[] {
  const canonicalPath = join(getProjectAgentsDir(targetPath), fileName);
  if (!existsSync(canonicalPath)) {
    return [];
  }

  const agentDir = join(targetPath, agentSubdir);
  if (!existsSync(agentDir)) {
    mkdirSync(agentDir, { recursive: true });
    transaction?.recordCreatedDir(agentDir);
  }

  const linkPath = join(agentDir, fileName);
  const relativeTarget = relative(dirname(linkPath), canonicalPath);

  if (existsSync(linkPath) || isSymlinkEntry(linkPath)) {
    const stats = lstatSync(linkPath);
    if (stats.isSymbolicLink() && readlinkSync(linkPath) === relativeTarget) {
      return [];
    }
    transaction?.recordBeforeWrite(linkPath);
    unlinkSync(linkPath);
  } else {
    transaction?.recordBeforeWrite(linkPath);
  }

  symlinkSync(relativeTarget, linkPath, "file");
  return [linkPath];
}

function isSymlinkEntry(entryPath: string): boolean {
  try {
    return lstatSync(entryPath).isSymbolicLink();
  } catch {
    return false;
  }
}
