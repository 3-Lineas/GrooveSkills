import * as prompts from "@clack/prompts";
import picocolors from "picocolors";
import { renderBanner } from "@/domains/ui/banners";
import { promptSkills } from "@/domains/ui/prompt-skills";
import { promptAgents } from "@/domains/ui/prompt-agents";
import { promptConfirmUninstall } from "@/domains/ui/prompt-confirm-uninstall";
import {
  resolveLanguageSelection,
  resolveOverwriteConfirmation,
} from "@/domains/ui/ui-resolvers";
import { installSkills } from "@/domains/installer/install-orchestrator";
import { formatOnboardingPrompt } from "@/domains/ui/render-onboarding-prompt";
import { formatReplacedFileNotes, renderInstallFailure } from "@/domains/ui/render-install-report";
import { getTerminalWidth, wrapText } from "@/domains/ui/terminal-layout";
import { resolveGrooveSkillsVersion } from "@/domains/harness/resolve-grooveskills-version";
import { InstallTransactionError } from "@/errors/install-transaction-error";
import type { ProjectContext } from "@/types/context.types";
import type { AgentId } from "@/types/agent.types";

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

  const safeMaxWidth = Math.max(getTerminalWidth(80) - 10, 50);
  const currentCliVersion = resolveGrooveSkillsVersion();

  if (context.detectedDependencies.length > 0 || context.harnessExists || context.installedVersion) {
    let harnessInfo = picocolors.cyan("Will be initialized");
    if (context.harnessExists && !forceOnboarding) {
      const versionTag = context.installedVersion
        ? `v${context.installedVersion}`
        : context.hasLegacyConfigVersion
          ? "legacy v1"
          : "unversioned";
      const upgradeHint =
        context.installedVersion && context.installedVersion !== currentCliVersion
          ? ` -> CLI v${currentCliVersion}`
          : "";
      harnessInfo = picocolors.green(
        `Active (${versionTag}${upgradeHint}, .grooveskills/memory, lang: ${context.configuredLanguage ?? "es"})`
      );
    }

    const formattedDependencies =
      context.detectedDependencies.length > 0
        ? context.detectedDependencies.map((dependencyName) => picocolors.bold(dependencyName)).join(", ")
        : "None";
    const formattedAgents =
      context.detectedAgents.map((agentName) => picocolors.green(agentName)).join(", ") ||
      "None (will be created)";

    const environmentNote = wrapText(
      `Detected dependencies: ${formattedDependencies}\n` +
        `Active AI folders: ${formattedAgents}\n` +
        `GrooveSkills Harness: ${harnessInfo}`,
      safeMaxWidth
    );

    prompts.note(environmentNote, "Project Environment");
  }

  const selectedSkills = await promptSkills(
    context.suggestedSkillIds,
    context.installedSkillIds
  );
  if (prompts.isCancel(selectedSkills)) {
    prompts.cancel("Installation cancelled. Have a wonderful day!");
    process.exit(0);
  }

  const selectedSkillIds = selectedSkills as string[];
  const deselectedSkills = context.installedSkillIds.filter(
    (skillId) => !selectedSkillIds.includes(skillId)
  );

  let skillsToRemove: string[] = [];
  if (deselectedSkills.length > 0) {
    const confirmRemoval = await promptConfirmUninstall(deselectedSkills);
    if (prompts.isCancel(confirmRemoval)) {
      prompts.cancel("Installation cancelled. Have a wonderful day!");
      process.exit(0);
    }
    if (confirmRemoval) {
      skillsToRemove = deselectedSkills;
    }
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
    selectedSkillIds,
    selectedAgents as AgentId[]
  );

  const installSpinner = prompts.spinner();
  installSpinner.start("Installing and adapting skills across your configured AI agents...");

  try {
    const installResult = await installSkills({
      targetPath: context.targetPath,
      selectedSkillIds,
      selectedAgents: selectedAgents as AgentId[],
      forceOverwrite,
      enableHarness: true,
      detectedDependencies: context.detectedDependencies,
      language: selectedLanguage,
      forceOnboarding,
      skillsToRemove,
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
      `GrooveSkills Version: v${installResult.installedVersion}`,
      wrapText(`Configured skills: ${formattedInstalledSkills}`, safeMaxWidth),
      ...(installResult.removedSkills && installResult.removedSkills.length > 0
        ? [
            wrapText(
              `Removed skills: ${installResult.removedSkills
                .map((skillId) => picocolors.red(skillId))
                .join(", ")}`,
              safeMaxWidth
            ),
          ]
        : []),
      `Target agents: ${formattedConfiguredAgents}`,
      `GrooveSkills Harness: ${harnessStatus}`,
      ...formatReplacedFileNotes(installResult.replacedFiles).map((note) =>
        wrapText(note, safeMaxWidth)
      ),
    ];

    prompts.note(summaryLines.join("\n"), "Installation Summary");

    if (installResult.harnessInitialized) {
      const promptRender = formatOnboardingPrompt(selectedLanguage);
      console.log(promptRender.formattedOutput);
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
