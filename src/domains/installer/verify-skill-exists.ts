import { lstatSync } from "node:fs";
import { join } from "node:path";
import type { AgentId } from "@/types/agent.types";

const AGENT_DESTINATION_MAP: Record<AgentId, (directoryName: string) => string> = {
  antigravity: (directoryName) => join(".agents", "skills", directoryName),
  claude: (directoryName) => join(".claude", "skills", directoryName),
  cursor: (directoryName) => join(".cursor", "rules", `${directoryName}.mdc`),
  gemini: (directoryName) => join(".gemini", "skills", directoryName),
};

export function verifySkillExists(
  targetPath: string,
  skillDirectoryName: string,
  agents: AgentId[]
): boolean {
  for (const agent of agents) {
    const relativePathResolver = AGENT_DESTINATION_MAP[agent];
    const destination = join(targetPath, relativePathResolver(skillDirectoryName));

    try {
      lstatSync(destination);
      return true;
    } catch {
      // Path does not exist
    }
  }

  return false;
}
