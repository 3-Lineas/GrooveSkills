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
import { formatOnboardingPrompt } from "@/domains/ui/render-onboarding-prompt";
import { InstallTransactionError } from "@/errors/install-transaction-error";
import type { ProjectContext } from "@/types/context.types";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

async function resolveLanguageSelection(
  harnessExists: boolean,
  configuredLanguage?: ProjectLanguage,
  forceOnboarding?: boolean
): Promise<ProjectLanguage> {
  if (harnessExists && !forceOnboarding) {
    return configuredLanguage ?? "es";
  }

  const langChoice = await promptLanguage(configuredLanguage ?? "es");
  if (p.isCancel(langChoice)) {
    p.cancel("Instalación cancelada. ¡Que tengas un excelente día!");
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
    p.cancel("Instalación detenida para proteger las skills existentes.");
    process.exit(0);
  }

  return Boolean(confirm);
}

function renderInstallFailure(error: InstallTransactionError): void {
  const { stage, causeError, rollbackReport, suggestedFix } = error;
  const rawMsg = causeError instanceof Error ? causeError.message : String(causeError);

  const lines: string[] = [
    `${pc.bold("Fase afectada:")} ${pc.yellow(stage)}`,
    `${pc.bold("Causa:")} ${pc.red(rawMsg)}`,
    "",
    pc.bold("Reporte de Rollback automático:"),
    ` • Archivos restaurados a su estado previo: ${pc.cyan(String(rollbackReport.restoredFiles.length))}`,
    ` • Archivos temporales eliminados: ${pc.cyan(String(rollbackReport.removedFiles.length))}`,
    ` • Directorios vacíos eliminados: ${pc.cyan(String(rollbackReport.removedDirs.length))}`,
  ];

  if (suggestedFix) {
    lines.push(
      "",
      pc.bold("Solución recomendada:"),
      ` Ejecuta en tu terminal: ${pc.green(suggestedFix)}`
    );
  }

  p.note(lines.join("\n"), "Detalles de la interrupción y reversión");
  p.outro(pc.yellow("Tu proyecto no sufrió alteraciones y se preservó intacto. Corrige la causa y vuelve a intentarlo cuando gustes."));
}

export async function runInteractiveUi(
  context: ProjectContext,
  forceOnboarding: boolean = false
): Promise<void> {
  console.log(renderBanner());
  p.intro(pc.magenta("¡Bienvenido a GrooveSkills! Configuremos tus agentes de IA con estándares limpios de arquitectura."));

  if (context.detectedDependencies.length > 0) {
    const harnessInfo = context.harnessExists && !forceOnboarding
      ? pc.green(`Activo (.grooveskills/memory, idioma: ${context.configuredLanguage ?? "es"})`)
      : pc.cyan("Será inicializado");

    p.note(
      `Dependencias detectadas: ${context.detectedDependencies.map((d) => pc.bold(d)).join(", ")}\n` +
      `Carpetas de IA activas: ${context.detectedAgents.map((a) => pc.green(a)).join(", ") || "Ninguna (se crearán)"}\n` +
      `GrooveSkills Harness: ${harnessInfo}`,
      "Entorno del Proyecto"
    );
  }

  const selectedSkills = await promptSkills(context.suggestedSkillIds);
  if (p.isCancel(selectedSkills)) {
    p.cancel("Instalación cancelada. ¡Que tengas un excelente día!");
    process.exit(0);
  }

  const selectedAgents = await promptAgents(context.detectedAgents);
  if (p.isCancel(selectedAgents)) {
    p.cancel("Instalación cancelada. ¡Que tengas un excelente día!");
    process.exit(0);
  }

  const selectedLanguage = await resolveLanguageSelection(
    context.harnessExists,
    context.configuredLanguage,
    forceOnboarding
  );

  const forceOverwrite = await resolveOverwriteConfirmation(
    context.targetPath,
    selectedSkills as string[],
    selectedAgents as AgentId[]
  );

  const s = p.spinner();
  s.start("Instalando y adaptando skills para tus agentes de IA configurados...");

  try {
    const result = await installSkills({
      targetPath: context.targetPath,
      selectedSkillIds: selectedSkills as string[],
      selectedAgents: selectedAgents as AgentId[],
      forceOverwrite,
      enableHarness: true,
      detectedDependencies: context.detectedDependencies,
      language: selectedLanguage,
      forceOnboarding,
    });

    s.stop(pc.green("¡Todas las skills y el harness fueron configurados exitosamente!"));

    const harnessStatus = result.harnessInitialized
      ? pc.green(`Inicializado en .grooveskills/ (Idioma: ${selectedLanguage})`)
      : pc.cyan(`Preservado en .grooveskills/ (Idioma: ${selectedLanguage})`);

    p.note(
      `Skills configuradas: ${result.installedSkills.map((sk) => pc.bold(sk)).join(", ")}\n` +
      `Agentes objetivo: ${result.configuredAgents.map((a) => pc.cyan(a)).join(", ")}\n` +
      `GrooveSkills Harness: ${harnessStatus}`,
      "Resumen de Instalación"
    );

    if (result.harnessInitialized) {
      const promptRender = formatOnboardingPrompt(selectedLanguage);
      p.note(
        pc.green(promptRender.prompt),
        promptRender.title
      );
    }

    p.outro(pc.green("¡Tus agentes de IA ahora están potenciados con los hábitos arquitectónicos de tu equipo! 🚀"));
  } catch (error) {
    s.stop(pc.yellow("La instalación no pudo completarse."));

    if (error instanceof InstallTransactionError) {
      renderInstallFailure(error);
      return;
    }

    throw error;
  }
}
