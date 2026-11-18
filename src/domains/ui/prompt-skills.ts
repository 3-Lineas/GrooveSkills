import * as prompts from "@clack/prompts";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { SkillCategory, SkillMetadata } from "@/types/skill.types";

const CATEGORY_ORDER: SkillCategory[] = [
  "Core & Methodology",
  "Architecture & Adapters",
  "GroovePack",
  "Languages & Testing",
  "Frameworks & UI",
];

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

function buildGroupedSkillOptions(
  selectableSkills: SkillMetadata[],
  suggestedSkillIds: string[],
  installedSkillIds: string[]
): Record<string, { value: string; label: string; hint: string }[]> {
  const groupedOptions: Record<string, { value: string; label: string; hint: string }[]> = {};

  for (const category of CATEGORY_ORDER) {
    const categorySkills = selectableSkills.filter((skill) => skill.category === category);
    if (categorySkills.length === 0) {
      continue;
    }

    groupedOptions[category] = categorySkills.map((skill) => {
      const isInstalled = installedSkillIds.includes(skill.id);
      const isSuggested = suggestedSkillIds.includes(skill.id);
      return {
        value: skill.id,
        label: skill.name,
        hint: resolveSkillHint(isInstalled, isSuggested, skill.description),
      };
    });
  }

  return groupedOptions;
}

export async function promptSkills(
  suggestedSkillIds: string[],
  installedSkillIds: string[] = []
): Promise<string[] | symbol> {
  const selectableSkills = SKILL_CATALOG.filter((skill) => !skill.isCoreHarness);
  const hasInstalledSkills = installedSkillIds.length > 0;
  const initialValues = hasInstalledSkills ? installedSkillIds : suggestedSkillIds;
  const groupedOptions = buildGroupedSkillOptions(
    selectableSkills,
    suggestedSkillIds,
    installedSkillIds
  );

  const selected = await prompts.groupMultiselect({
    message: "Which skills would you like to install in this project?",
    options: groupedOptions,
    initialValues,
    required: !hasInstalledSkills,
  });

  return selected;
}
