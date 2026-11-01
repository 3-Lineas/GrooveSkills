import * as p from "@clack/prompts";
import pc from "picocolors";
import { renderBanner } from "@/domains/ui/banners";
import { promptSkills } from "@/domains/ui/prompt-skills";
import { promptAgents } from "@/domains/ui/prompt-agents";
import { promptLanguage } from "@/domains/ui/prompt-language";
import { promptConfirmOverwrite } from "@/domains/ui/prompt-confirm-overwrite";
import { verifySkillExists } from "@/domains/installer/verify-skill-exists";
import { installSkills } from "@/domains/installer/install-orchestrator";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { ProjectContext } from "@/types/context.types";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

async function resolveLanguageSelection(
  harnessExists: boolean,
  configuredLanguage?: ProjectLanguage
): Promise<ProjectLanguage> {
  if (harnessExists) {
    return configuredLanguage ?? "es";
  }

  const langChoice = await promptLanguage(configuredLanguage ?? "es");
  if (p.isCancel(langChoice)) {
    p.cancel("Installation cancelled. Have a wonderful day!");
    process.exit(0);
  }

  return langChoice as ProjectLanguage;
}

async function resolveOverwriteConfirmation(
  targetPath: string,
  selectedSkills: string[],
  selectedAgents: AgentId[]
): Promise<boolean> {
  const anyExists = selectedSkills.some((skillId) => {
    const meta = SKILL_CATALOG.find((s) => s.id === skillId);
    return meta ? verifySkillExists(targetPath, meta.directoryName, selectedAgents) : false;
  });

  if (!anyExists) {
    return true;
  }

  const confirm = await promptConfirmOverwrite();
  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Installation stopped to protect existing skills.");
    process.exit(0);
  }

  return Boolean(confirm);
}

export async function runInteractiveUi(context: ProjectContext): Promise<void> {
  console.log(renderBanner());
  p.intro(pc.magenta("Welcome to GrooveSkills! Let's tailor your AI agents with clean architectural standards."));

  if (context.detectedDependencies.length > 0) {
    const harnessInfo = context.harnessExists
      ? pc.green(`Active (.grooveskills/memory, lang: ${context.configuredLanguage ?? "es"})`)
      : pc.cyan("Will be initialized");

    p.note(
      `Detected dependencies: ${context.detectedDependencies.map((d) => pc.bold(d)).join(", ")}\n` +
      `Active AI folders: ${context.detectedAgents.map((a) => pc.green(a)).join(", ") || "None (will be created)"}\n` +
      `GrooveSkills Harness: ${harnessInfo}`,
      "Project Environment"
    );
  }

  const selectedSkills = await promptSkills(context.suggestedSkillIds);
  if (p.isCancel(selectedSkills)) {
    p.cancel("Installation cancelled. Have a wonderful day!");
    process.exit(0);
  }

  const selectedAgents = await promptAgents(context.detectedAgents);
  if (p.isCancel(selectedAgents)) {
    p.cancel("Installation cancelled. Have a wonderful day!");
    process.exit(0);
  }

  const selectedLanguage = await resolveLanguageSelection(
    context.harnessExists,
    context.configuredLanguage
  );

  const forceOverwrite = await resolveOverwriteConfirmation(
    context.targetPath,
    selectedSkills as string[],
    selectedAgents as AgentId[]
  );

  const s = p.spinner();
  s.start("Installing and adapting skills across your configured AI agents...");

  const result = await installSkills({
    targetPath: context.targetPath,
    selectedSkillIds: selectedSkills as string[],
    selectedAgents: selectedAgents as AgentId[],
    forceOverwrite,
    enableHarness: true,
    detectedDependencies: context.detectedDependencies,
    language: selectedLanguage,
  });

  s.stop(pc.green("All skills and harness have been successfully configured!"));

  const harnessStatus = result.harnessInitialized
    ? pc.green(`Initialized in .grooveskills/ (Language: ${selectedLanguage})`)
    : pc.cyan(`Preserved in .grooveskills/ (Language: ${selectedLanguage})`);

  p.note(
    `Configured skills: ${result.installedSkills.map((s) => pc.bold(s)).join(", ")}\n` +
    `Target agents: ${result.configuredAgents.map((a) => pc.cyan(a)).join(", ")}\n` +
    `GrooveSkills Harness: ${harnessStatus}`,
    "Installation Summary"
  );

  p.outro(pc.green("Your AI programming pair is now empowered with your team's architectural habits! 🚀"));
}
