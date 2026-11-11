import { basename, resolve } from "node:path";
import { userInfo } from "node:os";
import picocolors from "picocolors";
import { detectProjectContext } from "@/domains/detector/project-detector";
import { runInteractiveUi } from "@/domains/ui/ui-orchestrator";
import { installSkills } from "@/domains/installer/install-orchestrator";
import { formatOnboardingPrompt } from "@/domains/ui/render-onboarding-prompt";
import { formatOwnerName } from "@/domains/fs/inspect-file-access";
import { resolveGrooveSkillsVersion } from "@/domains/harness/resolve-grooveskills-version";
import { renderProjectStatus } from "@/domains/ui/render-project-status";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

export interface CliOptions {
  skills?: string[];
  agents?: AgentId[];
  yes?: boolean;
  harness?: boolean;
  language?: ProjectLanguage;
  forceOnboarding?: boolean;
  isUpdate?: boolean;
  isAudit?: boolean;
  auditTarget?: string;
  outputDirectory?: string;
  isStatus?: boolean;
  statusTarget?: string;
  json?: boolean;
}

function resolveUsername(): string {
  try {
    return userInfo().username;
  } catch {
    return process.env.USER || process.env.LOGNAME || "current user";
  }
}

export async function runGrooveSkills(options: CliOptions = {}): Promise<void> {
  const targetPath = process.cwd();
  const context = detectProjectContext(targetPath);

  const hasSkills = options.skills && options.skills.length > 0;
  const hasAgents = options.agents && options.agents.length > 0;
  const isDirectHarness = Boolean(options.harness) && hasAgents;
  const isDirectInit = Boolean(options.forceOnboarding) && hasAgents;
  const isUpdateMode = Boolean(options.isUpdate);
  const isAuditMode = Boolean(options.isAudit);
  const isStatusMode = Boolean(options.isStatus);
  const currentCliVersion = resolveGrooveSkillsVersion();

  if (isStatusMode) {
    const resolvedTargetPath = options.statusTarget
      ? resolve(process.cwd(), options.statusTarget)
      : targetPath;
    const statusContext =
      resolvedTargetPath === targetPath ? context : detectProjectContext(resolvedTargetPath);
    renderProjectStatus(statusContext, currentCliVersion, Boolean(options.json));
    return;
  }

  if (isAuditMode) {
    const { runSecurityAudit } = await import("@/domains/audit/run-security-audit");
    await runSecurityAudit({
      targetPath: options.auditTarget || targetPath,
      outputDirectory: options.outputDirectory,
      language: options.language ?? context.configuredLanguage ?? "es",
    });
    return;
  }

  if (isUpdateMode) {
    const agentsToUpdate =
      options.agents && options.agents.length > 0
        ? options.agents
        : context.configuredAgents && context.configuredAgents.length > 0
          ? context.configuredAgents
          : context.detectedAgents.length > 0
            ? context.detectedAgents
            : (["antigravity"] as AgentId[]);

    const skillsToUpdate =
      options.skills && options.skills.length > 0
        ? options.skills
        : context.configuredSkills && context.configuredSkills.length > 0
          ? context.configuredSkills
          : context.suggestedSkillIds;

    const language = options.language ?? context.configuredLanguage ?? "es";
    const installedVersionLabel = context.installedVersion
      ? `v${context.installedVersion}`
      : context.hasLegacyConfigVersion
        ? "legacy v1"
        : "unversioned";

    console.log(
      picocolors.cyan(
        `Updating GrooveSkills harness (${installedVersionLabel} -> v${currentCliVersion}) and ${skillsToUpdate.length} skills in-place...`
      )
    );

    const result = await installSkills({
      targetPath,
      selectedSkillIds: skillsToUpdate,
      selectedAgents: agentsToUpdate,
      forceOverwrite: true,
      enableHarness: true,
      detectedDependencies: context.detectedDependencies,
      language,
      forceOnboarding: false,
    });

    console.log(
      picocolors.green(
        `✔ Updated harness instructions (v${result.installedVersion}), bitacora directory, and ${result.installedSkills.length} skills!`
      )
    );
    return;
  }

  if ((hasSkills && hasAgents) || isDirectHarness || isDirectInit) {
    const language = options.language ?? context.configuredLanguage ?? "es";
    const result = await installSkills({
      targetPath,
      selectedSkillIds: options.skills || [],
      selectedAgents: options.agents || [],
      forceOverwrite: Boolean(options.yes),
      enableHarness: true,
      detectedDependencies: context.detectedDependencies,
      language,
      forceOnboarding: options.forceOnboarding,
    });

    if (result.replacedFiles && result.replacedFiles.length > 0) {
      const currentUser = resolveUsername();
      for (const replacedItem of result.replacedFiles) {
        const fileName = basename(replacedItem.filePath);
        const previousOwner = formatOwnerName(replacedItem.previousOwnerUid);
        console.log(
          picocolors.yellow(
            `Note: ${fileName} was owned by ${previousOwner}. It was replaced atomically and is now owned by ${currentUser}.`
          )
        );
      }
    }

    if (result.harnessInitialized) {
      const promptRender = formatOnboardingPrompt(language);
      console.log(`\n${promptRender.formattedOutput}\n`);
    }

    return;
  }

  await runInteractiveUi(context, Boolean(options.forceOnboarding));
}
