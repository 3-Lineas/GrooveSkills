import { detectProjectContext } from "@/domains/detector/project-detector";
import { runInteractiveUi } from "@/domains/ui/ui-orchestrator";
import { installSkills } from "@/domains/installer/install-orchestrator";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

export interface CliOptions {
  skills?: string[];
  agents?: AgentId[];
  yes?: boolean;
  harness?: boolean;
  language?: ProjectLanguage;
}

export async function runGrooveSkills(options: CliOptions = {}): Promise<void> {
  const targetPath = process.cwd();
  const context = detectProjectContext(targetPath);

  const hasSkills = options.skills && options.skills.length > 0;
  const hasAgents = options.agents && options.agents.length > 0;
  const isDirectHarness = Boolean(options.harness) && hasAgents;

  if ((hasSkills && hasAgents) || isDirectHarness) {
    const language = options.language ?? context.configuredLanguage ?? "es";
    await installSkills({
      targetPath,
      selectedSkillIds: options.skills || [],
      selectedAgents: options.agents || [],
      forceOverwrite: Boolean(options.yes),
      enableHarness: true,
      detectedDependencies: context.detectedDependencies,
      language,
    });
    return;
  }

  await runInteractiveUi(context);
}
