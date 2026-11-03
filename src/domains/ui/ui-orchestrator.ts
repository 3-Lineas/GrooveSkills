import * as prompts from "@clack/prompts";
import picocolors from "picocolors";
import { renderBanner } from "@/domains/ui/banners";
import { promptSkills } from "@/domains/ui/prompt-skills";
import { promptAgents } from "@/domains/ui/prompt-agents";
import { promptLanguage } from "@/domains/ui/prompt-language";
import { promptConfirmOverwrite } from "@/domains/ui/prompt-confirm-overwrite";
import { verifySkillExists } from "@/domains/installer/verify-skill-exists";
import { installSkills } from "@/domains/installer/install-orchestrator";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import { formatOnboardingPrompt } from "@/domains/ui/render-onboarding-prompt";
import { formatReplacedFileNotes, renderInstallFailure } from "@/domains/ui/render-install-report";
import { InstallTransactionError } from "@/errors/install-transaction-error";
import type { ProjectContext } from "@/types/context.types";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

async function resolveLanguageSelection(
  harnessExists: boolean,
  configuredLanguage?: ProjectLanguage,
  forceOnboarding?: boolean
): Promise<ProjectLanguage> {
  if (harnessExists && !forceOnboarding) {
    return configuredLanguage ?? "es";
  }

  const languageSelection = await promptLanguage(configuredLanguage ?? "es");
  if (prompts.isCancel(languageSelection)) {
    prompts.cancel("Installation cancelled. Have a wonderful day!");
    process.exit(0);
  }

  return languageSelection as ProjectLanguage;
}

async function resolveOverwriteConfirmation(
  targetPath: string,
  selectedSkills: string[],
  selectedAgents: AgentId[]
): Promise<boolean> {
  const anyExists = selectedSkills.some((skillId) => {
    const skillMetadata = SKILL_CATALOG.find((skill) => skill.id === skillId);
    return skillMetadata
      ? verifySkillExists(targetPath, skillMetadata.directoryName, selectedAgents)
      : false;
  });

  if (!anyExists) {
    return true;
  }

  const overwriteConfirmed = await promptConfirmOverwrite();
  if (prompts.isCancel(overwriteConfirmed) || !overwriteConfirmed) {
    prompts.cancel("Installation stopped to protect existing skills.");
    process.exit(0);
  }

  return Boolean(overwriteConfirmed);
}

export async function runInteractiveUi(
  context: ProjectContext,
  forceOnboarding: boolean = false
): Promise<void> {
  console.log(renderBanner());
  prompts.intro(
    picocolors.magenta(
      "Welcome to GrooveSkills! Let's tailor your AI agents with clean architectural standards."
    )
  );

  if (context.detectedDependencies.length > 0) {
    const harnessInfo =
      context.harnessExists && !forceOnboarding
        ? picocolors.green(
            `Active (.grooveskills/memory, lang: ${context.configuredLanguage ?? "es"})`
          )
        : picocolors.cyan("Will be initialized");

    const formattedDependencies = context.detectedDependencies
      .map((dependencyName) => picocolors.bold(dependencyName))
      .join(", ");
    const formattedAgents =
      context.detectedAgents.map((agentName) => picocolors.green(agentName)).join(", ") ||
      "None (will be created)";

    prompts.note(
      `Detected dependencies: ${formattedDependencies}\n` +
        `Active AI folders: ${formattedAgents}\n` +
        `GrooveSkills Harness: ${harnessInfo}`,
      "Project Environment"
    );
  }

  const selectedSkills = await promptSkills(context.suggestedSkillIds);
  if (prompts.isCancel(selectedSkills)) {
    prompts.cancel("Installation cancelled. Have a wonderful day!");
    process.exit(0);
  }

  const selectedAgents = await promptAgents(context.detectedAgents);
  if (prompts.isCancel(selectedAgents)) {
    prompts.cancel("Installation cancelled. Have a wonderful day!");
    process.exit(0);
  }

  const selectedLanguage = await resolveLanguageSelection(
    context.harnessExists,
    context.configuredLanguage,
    forceOnboarding
  );

  const forceOverwrite = await resolveOverwriteConfirmation(
    context.targetPath,
    selectedSkills as string[],
    selectedAgents as AgentId[]
  );

  const installSpinner = prompts.spinner();
  installSpinner.start("Installing and adapting skills across your configured AI agents...");

  try {
    const installResult = await installSkills({
      targetPath: context.targetPath,
      selectedSkillIds: selectedSkills as string[],
      selectedAgents: selectedAgents as AgentId[],
      forceOverwrite,
      enableHarness: true,
      detectedDependencies: context.detectedDependencies,
      language: selectedLanguage,
      forceOnboarding,
    });

    installSpinner.stop(
      picocolors.green("All skills and harness have been successfully configured!")
    );

    const harnessStatus = installResult.harnessInitialized
      ? picocolors.green(`Initialized in .grooveskills/ (Language: ${selectedLanguage})`)
      : picocolors.cyan(`Preserved in .grooveskills/ (Language: ${selectedLanguage})`);

    const formattedInstalledSkills = installResult.installedSkills
      .map((skillId) => picocolors.bold(skillId))
      .join(", ");
    const formattedConfiguredAgents = installResult.configuredAgents
      .map((agentId) => picocolors.cyan(agentId))
      .join(", ");

    const summaryLines = [
      `Configured skills: ${formattedInstalledSkills}`,
      `Target agents: ${formattedConfiguredAgents}`,
      `GrooveSkills Harness: ${harnessStatus}`,
      ...formatReplacedFileNotes(installResult.replacedFiles),
    ];

    prompts.note(summaryLines.join("\n"), "Installation Summary");

    if (installResult.harnessInitialized) {
      const promptRender = formatOnboardingPrompt(selectedLanguage);
      prompts.note(picocolors.green(promptRender.prompt), promptRender.title);
    }

    prompts.outro(
      picocolors.green(
        "Your AI programming pair is now empowered with your team's architectural habits! 🚀"
      )
    );
  } catch (error) {
    installSpinner.stop(picocolors.yellow("Installation could not be completed."));

    if (error instanceof InstallTransactionError) {
      renderInstallFailure(error);
      return;
    }

    throw error;
  }
}
