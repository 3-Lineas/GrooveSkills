import type { RollbackReport } from "@/domains/fs/install-transaction";

export interface InstallTransactionErrorOptions {
  stage: string;
  cause: unknown;
  rollbackReport: RollbackReport;
  suggestedFix?: string;
}

export class InstallTransactionError extends Error {
  readonly stage: string;
  readonly causeError: unknown;
  readonly rollbackReport: RollbackReport;
  readonly suggestedFix?: string;

  constructor(options: InstallTransactionErrorOptions) {
    const rawMessage =
      options.cause instanceof Error ? options.cause.message : String(options.cause);
    super(`Error during stage '${options.stage}': ${rawMessage}`);
    this.name = "InstallTransactionError";
    this.stage = options.stage;
    this.causeError = options.cause;
    this.rollbackReport = options.rollbackReport;
    this.suggestedFix = options.suggestedFix;
  }
}
