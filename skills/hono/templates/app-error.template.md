# AppError Template

Use this template to create application errors with automatic logging.

```ts
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { Logger } from "@/logger/logger.ts";

export interface AppErrorParams {
  message: string;
  statusCode?: ContentfulStatusCode;
  code?: string;
  details?: unknown;
  silent?: boolean;
}

export class AppError extends Error {
  public statusCode: ContentfulStatusCode;
  public code: string;
  public details?: unknown;

  constructor({
    message,
    statusCode = 400,
    code = "BAD_REQUEST",
    details,
    silent = false,
  }: AppErrorParams) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    if (silent) {
      return;
    }

    const logger = new Logger(`API:Error:${this.name}`);
    logger.warn(`${code}: ${message}`, {
      details: details as Record<string, unknown>,
    });
  }
}
```
