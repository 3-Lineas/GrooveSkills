import { basename } from "node:path";
import { userInfo } from "node:os";
import picocolors from "picocolors";
import { detectProjectContext } from "@/domains/detector/project-detector";
import { runInteractiveUi } from "@/domains/ui/ui-orchestrator";
import { installSkills } from "@/domains/installer/install-orchestrator";
import { formatOnboardingPrompt } from "@/domains/ui/render-onboarding-prompt";
import { formatOwnerName } from "@/domains/fs/inspect-file-access";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

export interface CliOptions {
  skills?: string[];
  agents?: AgentId[];
  yes?: boolean;
  harness?: boolean;
  language?: ProjectLanguage;
  forceOnboarding?: boolean;
}

function resolveUsername(): string {
  try {
    return userInfo().username;
  } catch {
    return process.env.USER || process.env.LOGNAME || "current user";
  }
}

export async function runGrooveSkills(options: CliOptions = {}): Promise<void> {
  const targetPath = process.cwd();
  const context = detectProjectContext(targetPath);

  const hasSkills = options.skills && options.skills.length > 0;
  const hasAgents = options.agents && options.agents.length > 0;
  const isDirectHarness = Boolean(options.harness) && hasAgents;
  const isDirectInit = Boolean(options.forceOnboarding) && hasAgents;

  if ((hasSkills && hasAgents) || isDirectHarness || isDirectInit) {
    const language = options.language ?? context.configuredLanguage ?? "es";
    const result = await installSkills({
      targetPath,
      selectedSkillIds: options.skills || [],
      selectedAgents: options.agents || [],
      forceOverwrite: Boolean(options.yes),
      enableHarness: true,
      detectedDependencies: context.detectedDependencies,
      language,
      forceOnboarding: options.forceOnboarding,
    });

    if (result.replacedFiles && result.replacedFiles.length > 0) {
      const currentUser = resolveUsername();
      for (const replacedItem of result.replacedFiles) {
        const fileName = basename(replacedItem.filePath);
        const previousOwner = formatOwnerName(replacedItem.previousOwnerUid);
        console.log(
          picocolors.yellow(
            `Note: ${fileName} was owned by ${previousOwner}. It was replaced atomically and is now owned by ${currentUser}.`
          )
        );
      }
    }

    if (result.harnessInitialized) {
      const promptRender = formatOnboardingPrompt(language);
      console.log(`\n${promptRender.formattedOutput}\n`);
    }

    return;
  }

  await runInteractiveUi(context, Boolean(options.forceOnboarding));
}
