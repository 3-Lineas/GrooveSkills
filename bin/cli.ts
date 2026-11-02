#!/usr/bin/env node
import { Command } from "commander";
import { runGrooveSkills } from "@/main";
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
      console.error("An unexpected error occurred while running GrooveSkills:", error);
      process.exit(1);
    }
  });

program.parse();
