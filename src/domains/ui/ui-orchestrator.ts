import * as p from "@clack/prompts";
import pc from "picocolors";
import { renderBanner } from "@/domains/ui/banners";
import { promptSkills } from "@/domains/ui/prompt-skills";
import { promptAgents } from "@/domains/ui/prompt-agents";
import { promptConfirmOverwrite } from "@/domains/ui/prompt-confirm-overwrite";
import { verifySkillExists } from "@/domains/installer/verify-skill-exists";
import { installSkills } from "@/domains/installer/install-orchestrator";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { ProjectContext } from "@/types/context.types";
import type { AgentId } from "@/types/agent.types";

export async function runInteractiveUi(context: ProjectContext): Promise<void> {
  console.log(renderBanner());
  p.intro(pc.magenta("Welcome to GrooveSkills! Let's tailor your AI agents with clean architectural standards."));

  if (context.detectedDependencies.length > 0) {
    p.note(
      `Detected dependencies: ${context.detectedDependencies.map((d) => pc.bold(d)).join(", ")}\n` +
      `Active AI folders: ${context.detectedAgents.map((a) => pc.green(a)).join(", ") || "None (will be created)"}`,
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

  let forceOverwrite = true;
  const anyExists = (selectedSkills as string[]).some((skillId) => {
    const meta = SKILL_CATALOG.find((s) => s.id === skillId);
    return meta ? verifySkillExists(context.targetPath, meta.directoryName, selectedAgents as AgentId[]) : false;
  });

  if (anyExists) {
    const confirm = await promptConfirmOverwrite();
    if (p.isCancel(confirm) || !confirm) {
      p.cancel("Installation stopped to protect existing skills.");
      process.exit(0);
    }
    forceOverwrite = Boolean(confirm);
  }

  const s = p.spinner();
  s.start("Installing and adapting skills across your configured AI agents...");

  const result = await installSkills({
    targetPath: context.targetPath,
    selectedSkillIds: selectedSkills as string[],
    selectedAgents: selectedAgents as AgentId[],
    forceOverwrite,
  });

  s.stop(pc.green("All skills have been successfully installed and configured!"));

  p.note(
    `Configured skills: ${result.installedSkills.map((s) => pc.bold(s)).join(", ")}\n` +
    `Target agents: ${result.configuredAgents.map((a) => pc.cyan(a)).join(", ")}`,
    "Installation Summary"
  );

  p.outro(pc.green("Your AI programming pair is now empowered with your team's architectural habits! 🚀"));
}
