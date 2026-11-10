import * as prompts from "@clack/prompts";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

export async function promptConfirmUninstall(
  deselectedSkillIds: string[]
): Promise<boolean | symbol> {
  const skillNames = deselectedSkillIds
    .map((skillId) => {
      const skill = SKILL_CATALOG.find((catalogItem) => catalogItem.id === skillId);
      return skill ? skill.name : skillId;
    })
    .join(", ");

  const count = deselectedSkillIds.length;
  const message = `You unchecked ${count} installed skill(s) (${skillNames}). Do you want to remove them completely from the project?`;

  return prompts.confirm({
    message,
    initialValue: false,
  });
}
