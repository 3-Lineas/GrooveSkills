import { existsSync, lstatSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { getProjectAgentsDir } from "@/domains/project-store/project-paths";
import { AGENT_PROFILE_CATALOG } from "@/domains/registry/agent-profile-catalog";
import type { InstallTransaction } from "@/domains/fs/install-transaction";

const AGENT_PROFILE_DIRS = [
  ".agents/agents",
  ".claude/agents",
  ".gemini/agents",
];

export function removeAgentProfiles(
  targetPath: string,
  profileIdsToRemove: string[],
  transaction?: InstallTransaction
): string[] {
  if (profileIdsToRemove.length === 0) {
    return [];
  }

  const removedProfiles: string[] = [];
  const canonicalDir = getProjectAgentsDir(targetPath);

  for (const profileId of profileIdsToRemove) {
    const profileMeta = AGENT_PROFILE_CATALOG.find(
      (entry) => entry.id === profileId
    );
    const fileName = profileMeta?.fileName ?? `${profileId}.md`;
    let removedAny = false;

    const canonicalPath = join(canonicalDir, fileName);
    if (existsSync(canonicalPath)) {
      transaction?.recordBeforeWrite(canonicalPath);
      unlinkSync(canonicalPath);
      removedAny = true;
    }

    for (const agentSubdir of AGENT_PROFILE_DIRS) {
      const linkPath = join(targetPath, agentSubdir, fileName);
      if (existsSync(linkPath) || isSymlinkEntry(linkPath)) {
        transaction?.recordBeforeWrite(linkPath);
        unlinkSync(linkPath);
        removedAny = true;
      }
    }

    if (removedAny) {
      removedProfiles.push(profileId);
    }
  }

  return removedProfiles;
}

function isSymlinkEntry(entryPath: string): boolean {
  try {
    return lstatSync(entryPath).isSymbolicLink();
  } catch {
    return false;
  }
}
