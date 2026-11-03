#!/usr/bin/env node
import { Command } from "commander";
import picocolors from "picocolors";
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
        const causeMessage = causeError instanceof Error ? causeError.message : String(causeError);
        const nothingTouched =
          rollbackReport.restoredFiles.length === 0 &&
          rollbackReport.removedFiles.length === 0 &&
          rollbackReport.removedDirs.length === 0 &&
          rollbackReport.failures.length === 0;

        console.error(picocolors.red(`\n✖ Installation failed at stage: ${stage}`));
        console.error(picocolors.red(`  Cause: ${causeMessage}`));

        if (nothingTouched) {
          console.error(picocolors.yellow("  Rollback: Nothing to roll back, no files were modified."));
        } else {
          console.error(picocolors.yellow("\nRollback summary:"));
          console.error(` • Restored files: ${rollbackReport.restoredFiles.length}`);
          console.error(` • Removed temporary files: ${rollbackReport.removedFiles.length}`);
          console.error(` • Removed empty directories: ${rollbackReport.removedDirs.length}`);

          if (!rollbackReport.isClean) {
            console.error(
              picocolors.red("\nRollback was incomplete. These files may need manual review:")
            );
            for (const failure of rollbackReport.failures) {
              console.error(` • ${failure.path} (${failure.reason})`);
            }
          }
        }

        if (suggestedFix) {
          console.error(picocolors.green(`\nSuggested fix:\n  ${suggestedFix}`));
        }

        if (rollbackReport.isClean) {
          console.error(
            picocolors.dim(
              nothingTouched
                ? "\nNo files were modified.\n"
                : "\nYour project was restored to its previous state.\n"
            )
          );
        }
        process.exit(1);
      }

      console.error(picocolors.red("An unexpected error occurred while running GrooveSkills:"), error);
      process.exit(1);
    }
  });

program.parse();
