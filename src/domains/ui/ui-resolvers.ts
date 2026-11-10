import * as prompts from "@clack/prompts";
import { promptLanguage } from "@/domains/ui/prompt-language";
import { promptConfirmOverwrite } from "@/domains/ui/prompt-confirm-overwrite";
import { verifySkillExists } from "@/domains/installer/verify-skill-exists";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

export async function resolveLanguageSelection(
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

export async function resolveOverwriteConfirmation(
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
