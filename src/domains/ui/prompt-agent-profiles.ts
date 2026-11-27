import * as prompts from "@clack/prompts";
import { AGENT_PROFILE_CATALOG } from "@/domains/registry/agent-profile-catalog";

export async function promptAgentProfiles(
  suggestedProfileIds: string[],
  installedProfileIds: string[]
): Promise<string[] | symbol> {
  const initialValues =
    installedProfileIds.length > 0 ? installedProfileIds : suggestedProfileIds;

  return prompts.multiselect({
    message:
      "Select specialized agent profiles to install (Antigravity / Claude Code / Gemini)",
    options: [
      ...AGENT_PROFILE_CATALOG.map((profile) => {
        const isInstalled = installedProfileIds.includes(profile.id);
        const isSuggested = suggestedProfileIds.includes(profile.id);

        let hint = profile.description;
        if (isInstalled) {
          hint = "Installed";
        } else if (isSuggested) {
          hint = "Suggested for your stack";
        }

        return {
          value: profile.id,
          label: profile.name,
          hint,
        };
      }),
      {
        value: "none",
        label: "None (skip specialized agent profiles)",
        hint: "Install only skills and harness",
      },
    ],
    initialValues,
    required: false,
  });
}
