import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildAgentHarnessBlock } from "@/domains/harness/harness-templates";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

const START_MARKER = "<!-- grooveskills:harness:start -->";
const END_MARKER = "<!-- grooveskills:harness:end -->";

function applyHarnessBlock(filePath: string, language: ProjectLanguage = "es"): void {
  const block = buildAgentHarnessBlock(language);

  if (!existsSync(filePath)) {
    writeFileSync(filePath, `${block}\n`, "utf-8");
    return;
  }

  const existingContent = readFileSync(filePath, "utf-8");

  if (existingContent.includes(START_MARKER) && existingContent.includes(END_MARKER)) {
    const regex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, "g");
    const updated = existingContent.replace(regex, block);
    writeFileSync(filePath, updated, "utf-8");
    return;
  }

  const separator = existingContent.endsWith("\n") ? "\n" : "\n\n";
  writeFileSync(filePath, `${existingContent}${separator}${block}\n`, "utf-8");
}

export function upsertAgentInstructions(
  targetPath: string,
  selectedAgents: AgentId[],
  language: ProjectLanguage = "es"
): string[] {
  const updatedFiles: string[] = [];

  const agentsMdPath = join(targetPath, "AGENTS.md");
  applyHarnessBlock(agentsMdPath, language);
  updatedFiles.push(agentsMdPath);

  if (selectedAgents.includes("claude")) {
    const claudeMdPath = join(targetPath, "CLAUDE.md");
    applyHarnessBlock(claudeMdPath, language);
    updatedFiles.push(claudeMdPath);
  }

  return updatedFiles;
}
