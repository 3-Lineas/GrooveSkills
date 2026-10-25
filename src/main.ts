import { detectProjectContext } from "@/domains/detector/project-detector";
import { runInteractiveUi } from "@/domains/ui/ui-orchestrator";
import { installSkills } from "@/domains/installer/install-orchestrator";
import type { AgentId } from "@/types/agent.types";

export interface CliOptions {
  skills?: string[];
  agents?: AgentId[];
  yes?: boolean;
}

export async function runGrooveSkills(options: CliOptions = {}): Promise<void> {
  const targetPath = process.cwd();
  const context = detectProjectContext(targetPath);

  if (options.skills && options.skills.length > 0 && options.agents && options.agents.length > 0) {
    await installSkills({
      targetPath,
      selectedSkillIds: options.skills,
      selectedAgents: options.agents,
      forceOverwrite: Boolean(options.yes),
    });
    return;
  }

  await runInteractiveUi(context);
}
