import { lstatSync } from "node:fs";
import { join } from "node:path";
import type { AgentId } from "@/types/agent.types";

const AGENT_DESTINATION_MAP: Record<AgentId, (dir: string) => string> = {
  antigravity: (dir) => join(".agents", "skills", dir),
  claude: (dir) => join(".claude", "skills", dir),
  cursor: (dir) => join(".cursor", "rules", `${dir}.mdc`),
  gemini: (dir) => join(".gemini", "skills", dir),
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
