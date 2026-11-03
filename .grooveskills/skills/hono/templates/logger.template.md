# Logger Template

Universal structured logger for development (ANSI colored) and Cloudflare Workers (structured JSON).

```ts
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  file?: string;
  line?: number;
  [key: string]: unknown;
}

export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private isDev(): boolean {
    if (typeof process !== "undefined" && process.env) {
      return (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
      );
    }
    return true;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    ...args: unknown[]
  ): void {
    const timestamp = new Date().toISOString();

    if (this.isDev()) {
      const colors: Record<LogLevel, string> = {
        debug: "\x1b[36m",
        info: "\x1b[32m",
        warn: "\x1b[33m",
        error: "\x1b[31m",
      };
      const reset = "\x1b[0m";
      const color = colors[level] || reset;
      const origin = context?.file ? ` [${context.file}${context.line ? `:${context.line}` : ""}]` : "";

      console.log(
        `${color}[${timestamp}] [${level.toUpperCase()}] [${this.serviceName}]${origin}:${reset} ${message}`,
        context ?? "",
        ...args,
      );
      return;
    }

    const payload = {
      timestamp,
      level,
      serviceName: this.serviceName,
      message,
      context,
      details: args.length > 0 ? args : undefined,
    };

    if (level === "error") {
      console.error(JSON.stringify(payload));
      return;
    }
    if (level === "warn") {
      console.warn(JSON.stringify(payload));
      return;
    }
    console.log(JSON.stringify(payload));
  }

  debug(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log("debug", message, context, ...args);
  }

  info(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log("info", message, context, ...args);
  }

  warn(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log("warn", message, context, ...args);
  }

  error(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log("error", message, context, ...args);
  }
}
```
