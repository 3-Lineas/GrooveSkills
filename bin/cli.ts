#!/usr/bin/env node
import { Command } from "commander";
import { runGrooveSkills } from "@/main";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

const program = new Command();

program
  .name("grooveskills")
  .description("Multi-agent AI skills and architecture standards installer")
  .version(__VERSION__)
  .option("-s, --skills <skills...>", "Specific skill IDs to install (e.g. best-practices hono groove-harness)")
  .option("-a, --agents <agents...>", "Target AI agents (antigravity claude cursor gemini)")
  .option("-y, --yes", "Automatically confirm overwrite of existing skills", false)
  .option("--harness", "Initialize or update GrooveSkills project harness in .grooveskills/")
  .option("-l, --language <lang>", "Project user copy language (es, en, pt, it, fr)")
  .action(async (options: {
    skills?: string[];
    agents?: string[];
    yes?: boolean;
    harness?: boolean;
    language?: string;
  }) => {
    try {
      await runGrooveSkills({
        skills: options.skills,
        agents: options.agents as AgentId[] | undefined,
        yes: options.yes,
        harness: options.harness,
        language: options.language as ProjectLanguage | undefined,
      });
    } catch (error) {
      console.error("An unexpected error occurred while running GrooveSkills:", error);
      process.exit(1);
    }
  });

program.parse();
