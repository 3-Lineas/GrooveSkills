#!/usr/bin/env node
import { Command } from "commander";
import { runGrooveSkills } from "@/main";
import type { AgentId } from "@/types/agent.types";

const program = new Command();

program
  .name("grooveskills")
  .description("Multi-agent AI skills and architecture standards installer")
  .version("1.1.1")
  .option("-s, --skills <skills...>", "Specific skill IDs to install (e.g. best-practices hono groove-harness)")
  .option("-a, --agents <agents...>", "Target AI agents (antigravity claude cursor gemini)")
  .option("-y, --yes", "Automatically confirm overwrite of existing skills", false)
  .option("--harness", "Initialize or update GrooveSkills project harness in .grooveskills/")
  .option("--no-harness", "Skip harness initialization")
  .action(async (options: { skills?: string[]; agents?: string[]; yes?: boolean; harness?: boolean }) => {
    try {
      await runGrooveSkills({
        skills: options.skills,
        agents: options.agents as AgentId[] | undefined,
        yes: options.yes,
        harness: options.harness,
      });
    } catch (error) {
      console.error("An unexpected error occurred while running GrooveSkills:", error);
      process.exit(1);
    }
  });

program.parse();
