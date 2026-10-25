import * as p from "@clack/prompts";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

export async function promptSkills(suggestedSkillIds: string[]): Promise<string[] | symbol> {
  const options = SKILL_CATALOG.map((skill) => {
    const isSuggested = suggestedSkillIds.includes(skill.id);
    return {
      value: skill.id,
      label: skill.name,
      hint: isSuggested ? "Suggested based on your project stack" : skill.description,
    };
  });

  const selected = await p.multiselect({
    message: "Which skills would you like to install in this project?",
    options,
    initialValues: suggestedSkillIds,
    required: true,
  });

  return selected;
}
