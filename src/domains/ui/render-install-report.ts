import { basename } from "node:path";
import { userInfo } from "node:os";
import * as prompts from "@clack/prompts";
import picocolors from "picocolors";
import { formatOwnerName } from "@/domains/fs/inspect-file-access";
import { InstallTransactionError } from "@/errors/install-transaction-error";
import type { ReplacedFileNotice } from "@/domains/fs/install-transaction";

export function getCurrentUsername(): string {
  try {
    return userInfo().username;
  } catch {
    return process.env.USER || process.env.LOGNAME || "current user";
  }
}

export function formatReplacedFileNotes(replacedFiles: ReplacedFileNotice[] = []): string[] {
  if (replacedFiles.length === 0) {
    return [];
  }
  const currentUser = getCurrentUsername();
  return replacedFiles.map((replacedItem) => {
    const fileName = basename(replacedItem.filePath);
    const previousOwner = formatOwnerName(replacedItem.previousOwnerUid);
    return picocolors.yellow(
      `Note: ${fileName} was owned by ${previousOwner}. It was replaced atomically and is now owned by ${currentUser}.`
    );
  });
}

export function renderInstallFailure(error: InstallTransactionError): void {
  const { stage, causeError, rollbackReport, suggestedFix } = error;
  const causeMessage = causeError instanceof Error ? causeError.message : String(causeError);
  const nothingTouched =
    rollbackReport.restoredFiles.length === 0 &&
    rollbackReport.removedFiles.length === 0 &&
    rollbackReport.removedDirs.length === 0 &&
    rollbackReport.failures.length === 0;

  const lines: string[] = [
    `${picocolors.bold("Failed stage:")}  ${picocolors.yellow(stage)}`,
    `${picocolors.bold("Cause:")}         ${picocolors.red(causeMessage)}`,
  ];

  if (nothingTouched) {
    lines.push(`${picocolors.bold("Rollback:")}      Nothing to roll back, no files were modified.`);
  } else {
    lines.push(
      "",
      picocolors.bold("Rollback summary:"),
      ` • Restored files: ${picocolors.cyan(String(rollbackReport.restoredFiles.length))}`,
      ` • Removed temporary files: ${picocolors.cyan(String(rollbackReport.removedFiles.length))}`,
      ` • Removed empty directories: ${picocolors.cyan(String(rollbackReport.removedDirs.length))}`
    );
    if (!rollbackReport.isClean) {
      lines.push("", picocolors.red("Rollback was incomplete. These files may need manual review:"));
      for (const failure of rollbackReport.failures) {
        lines.push(` • ${failure.path} (${failure.reason})`);
      }
    }
  }

  if (suggestedFix) {
    lines.push(`${picocolors.bold("Suggested fix:")} ${picocolors.green(suggestedFix)}`);
  }

  prompts.note(lines.join("\n"), "Installation Aborted");

  if (!rollbackReport.isClean) {
    prompts.outro(
      picocolors.red(
        "Rollback was incomplete. Please review the files listed above and apply the suggested fix."
      )
    );
    return;
  }

  prompts.outro(
    picocolors.yellow(
      nothingTouched
        ? "No files were modified. Apply the suggested fix and try again."
        : "Your project was restored to its previous state. Apply the suggested fix and try again."
    )
  );
}
