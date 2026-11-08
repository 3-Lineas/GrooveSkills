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
  isUpdate?: boolean;
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
  const isUpdateMode = Boolean(options.isUpdate);

  if (isUpdateMode) {
    const agentsToUpdate =
      options.agents && options.agents.length > 0
        ? options.agents
        : context.configuredAgents && context.configuredAgents.length > 0
          ? context.configuredAgents
          : context.detectedAgents.length > 0
            ? context.detectedAgents
            : (["antigravity"] as AgentId[]);

    const skillsToUpdate =
      options.skills && options.skills.length > 0
        ? options.skills
        : context.configuredSkills && context.configuredSkills.length > 0
          ? context.configuredSkills
          : context.suggestedSkillIds;

    const language = options.language ?? context.configuredLanguage ?? "es";

    console.log(
      picocolors.cyan(
        `Updating GrooveSkills harness and ${skillsToUpdate.length} skills in-place...`
      )
    );

    const result = await installSkills({
      targetPath,
      selectedSkillIds: skillsToUpdate,
      selectedAgents: agentsToUpdate,
      forceOverwrite: true,
      enableHarness: true,
      detectedDependencies: context.detectedDependencies,
      language,
      forceOnboarding: false,
    });

    console.log(
      picocolors.green(
        `✔ Updated harness instructions, bitacora directory, and ${result.installedSkills.length} skills!`
      )
    );
    return;
  }

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
