#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { runGrooveSkills } from "@/main";
import { InstallTransactionError } from "@/errors/install-transaction-error";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

interface CliRawOptions {
  skills?: string[];
  agents?: string[];
  yes?: boolean;
  language?: string;
}

const program = new Command();

program
  .name("grooveskills")
  .description("Multi-agent AI skills, ODD workflow, and persistent project harness installer")
  .version(__VERSION__)
  .argument("[command]", "Optional command: use 'init' to initialize or re-run full project onboarding")
  .option("-s, --skills <skills...>", "Specific skill IDs to install (e.g. odd-ai best-practices hono)")
  .option("-a, --agents <agents...>", "Target AI agents (antigravity claude cursor gemini)")
  .option("-y, --yes", "Automatically confirm overwrite of existing skills", false)
  .option("-l, --language <lang>", "Project user copy language (es, en, pt, it, fr)")
  .action(async (command: string | undefined, options: CliRawOptions) => {
    try {
      const forceOnboarding = command === "init";
      await runGrooveSkills({
        skills: options.skills,
        agents: options.agents as AgentId[] | undefined,
        yes: options.yes,
        harness: true,
        language: options.language as ProjectLanguage | undefined,
        forceOnboarding,
      });
    } catch (error) {
      if (error instanceof InstallTransactionError) {
        const { stage, causeError, rollbackReport, suggestedFix } = error;
        const rawMsg = causeError instanceof Error ? causeError.message : String(causeError);

        console.error(pc.red(`\n✖ La instalación se interrumpió en la fase: ${stage}`));
        console.error(pc.red(`  Causa: ${rawMsg}`));
        console.error(pc.yellow("\nReporte de Rollback automático:"));
        console.error(` • Archivos restaurados a su estado previo: ${rollbackReport.restoredFiles.length}`);
        console.error(` • Archivos temporales eliminados: ${rollbackReport.removedFiles.length}`);
        console.error(` • Directorios vacíos eliminados: ${rollbackReport.removedDirs.length}`);

        if (suggestedFix) {
          console.error(pc.green(`\nSolución sugerida:\n  ${suggestedFix}`));
        }
        console.error(pc.dim("\nTu proyecto se preservó intacto.\n"));
        process.exit(1);
      }

      console.error(pc.red("Ocurrió un error inesperado al ejecutar GrooveSkills:"), error);
      process.exit(1);
    }
  });

program.parse();
