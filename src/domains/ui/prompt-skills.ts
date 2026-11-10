import * as prompts from "@clack/prompts";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

function resolveSkillHint(
  isInstalled: boolean,
  isSuggested: boolean,
  fallbackDescription: string
): string {
  if (isInstalled && isSuggested) {
    return "Installed • Suggested for your stack";
  }
  if (isInstalled) {
    return "Installed";
  }
  if (isSuggested) {
    return "Suggested based on your project stack";
  }
  return fallbackDescription;
}

export async function promptSkills(
  suggestedSkillIds: string[],
  installedSkillIds: string[] = []
): Promise<string[] | symbol> {
  const selectableSkills = SKILL_CATALOG.filter((skill) => !skill.isCoreHarness);
  const hasInstalledSkills = installedSkillIds.length > 0;
  const initialValues = hasInstalledSkills ? installedSkillIds : suggestedSkillIds;

  const options = selectableSkills.map((skill) => {
    const isInstalled = installedSkillIds.includes(skill.id);
    const isSuggested = suggestedSkillIds.includes(skill.id);
    return {
      value: skill.id,
      label: skill.name,
      hint: resolveSkillHint(isInstalled, isSuggested, skill.description),
    };
  });

  const selected = await prompts.multiselect({
    message: "Which skills would you like to install in this project?",
    options,
    initialValues,
    required: !hasInstalledSkills,
  });

  return selected;
}
