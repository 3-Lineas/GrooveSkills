import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildAgentHarnessBlock } from "@/domains/harness/harness-templates";
import { safeWriteFileSync } from "@/domains/fs/safe-file-writer";
import type { InstallTransaction } from "@/domains/fs/install-transaction";
import type { AgentId } from "@/types/agent.types";
import type { ProjectLanguage } from "@/types/harness.types";

const START_MARKER = "<!-- grooveskills:harness:start -->";
const END_MARKER = "<!-- grooveskills:harness:end -->";

function writeWithTransaction(
  filePath: string,
  content: string,
  transaction?: InstallTransaction
): void {
  const outcome = safeWriteFileSync(filePath, content);
  if (outcome.strategy === "replaced" && transaction) {
    transaction.recordReplacedFile(filePath, outcome.previousOwnerUid);
  }
}

function applyHarnessBlock(
  filePath: string,
  language: ProjectLanguage = "es",
  transaction?: InstallTransaction
): void {
  if (transaction) {
    transaction.recordBeforeWrite(filePath);
  }

  const block = buildAgentHarnessBlock(language);

  if (!existsSync(filePath)) {
    writeWithTransaction(filePath, `${block}\n`, transaction);
    return;
  }

  const existingContent = readFileSync(filePath, "utf-8");

  if (existingContent.includes(START_MARKER) && existingContent.includes(END_MARKER)) {
    const regex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, "g");
    const updated = existingContent.replace(regex, block);
    writeWithTransaction(filePath, updated, transaction);
    return;
  }

  const separator = existingContent.endsWith("\n") ? "\n" : "\n\n";
  writeWithTransaction(filePath, `${existingContent}${separator}${block}\n`, transaction);
}

export function upsertAgentInstructions(
  targetPath: string,
  selectedAgents: AgentId[],
  language: ProjectLanguage = "es",
  transaction?: InstallTransaction
): string[] {
  const updatedFiles: string[] = [];

  const agentsMdPath = join(targetPath, "AGENTS.md");
  applyHarnessBlock(agentsMdPath, language, transaction);
  updatedFiles.push(agentsMdPath);

  if (selectedAgents.includes("claude")) {
    const claudeMdPath = join(targetPath, "CLAUDE.md");
    applyHarnessBlock(claudeMdPath, language, transaction);
    updatedFiles.push(claudeMdPath);
  }

  return updatedFiles;
}
