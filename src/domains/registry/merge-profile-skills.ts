import { AGENT_PROFILE_CATALOG } from "@/domains/registry/agent-profile-catalog";

export function mergeProfileSkills(
  selectedProfileIds: string[],
  baseSkillIds: string[]
): string[] {
  if (selectedProfileIds.length === 0) {
    return baseSkillIds;
  }

  const merged = new Set<string>(baseSkillIds);

  for (const profileId of selectedProfileIds) {
    const profileMeta = AGENT_PROFILE_CATALOG.find(
      (entry) => entry.id === profileId
    );
    if (!profileMeta) {
      continue;
    }

    for (const skillId of profileMeta.recommendedSkills) {
      if (skillId === "nextjs-architecture" && merged.has("react-create-page")) {
        merged.delete("react-create-page");
      } else if (
        skillId === "react-create-page" &&
        merged.has("nextjs-architecture")
      ) {
        merged.delete("nextjs-architecture");
      }
      merged.add(skillId);
    }
  }

  return Array.from(merged);
}
