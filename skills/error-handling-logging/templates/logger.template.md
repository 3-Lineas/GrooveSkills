# Template: Structured Logger

Copy or adapt this template when setting up logging in your project: `src/utils/logger.ts`.

```ts
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

export class Logger {
  private static format(level: LogLevel, message: string, context?: LogContext): string {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...(context ? { context } : {}),
    };
    return JSON.stringify(entry);
  }

  static debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("debug", message, context));
    }
  }

  static info(message: string, context?: LogContext): void {
    console.info(this.format("info", message, context));
  }

  static warn(message: string, context?: LogContext): void {
    console.warn(this.format("warn", message, context));
  }

  static error(message: string, context?: LogContext): void {
    console.error(this.format("error", message, context));
  }
}
```
