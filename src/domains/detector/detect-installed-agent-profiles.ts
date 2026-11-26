import { existsSync, readdirSync } from "node:fs";
import { getProjectAgentsDir } from "@/domains/project-store/project-paths";
import { AGENT_PROFILE_CATALOG } from "@/domains/registry/agent-profile-catalog";

export function detectInstalledAgentProfiles(
  targetPath: string,
  configuredAgentProfiles?: string[]
): string[] {
  const detectedIds = new Set<string>(configuredAgentProfiles ?? []);
  const projectAgentsDir = getProjectAgentsDir(targetPath);

  if (!existsSync(projectAgentsDir)) {
    return Array.from(detectedIds);
  }

  try {
    const entries = readdirSync(projectAgentsDir);
    for (const entry of entries) {
      const matched = AGENT_PROFILE_CATALOG.find(
        (profile) => profile.fileName === entry
      );
      if (matched) {
        detectedIds.add(matched.id);
      }
    }
  } catch {
    // Ignore unreadable directory
  }

  return Array.from(detectedIds);
}
