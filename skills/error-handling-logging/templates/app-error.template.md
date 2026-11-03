# Template: AppError Base Class

Copy or adapt this template when setting up error handling in your project: `src/errors/app-error.ts`.

```ts
import { Logger } from "@/utils/logger";

export interface AppErrorOptions {
  message: string;
  statusCode?: number;
  code?: string;
  details?: unknown;
  cause?: unknown;
  /** When true, suppresses automatic warning logging for expected business conflicts */
  silent?: boolean;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  readonly timestamp: string;

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "AppError";
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? "INTERNAL_SERVER_ERROR";
    this.details = options.details;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    if (!options.silent) {
      const logger = new Logger(`API:Error:${this.name}`);
      logger.warn(`${this.code}: ${this.message}`, { details: this.details });
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}
```
