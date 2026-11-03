# Global Error Handler Template

Centralized Hono error handler for AppError, Valibot validation issues, and unexpected crashes.

```ts
import type { ErrorHandler } from "hono";
import { AppError } from "@/errors/app-error.ts";
import { Logger } from "@/logger/logger.ts";

export const globalErrorHandler: ErrorHandler = (error, ctx) => {
  const logger = new Logger("API:GlobalErrorHandler");
  const logContext = {
    file: "error-handler.ts",
    method: ctx.req.method,
    url: ctx.req.url,
  };

  if (error instanceof AppError) {
    return ctx.json(
      {
        success: false,
        message: error.message,
        error: error.code,
      },
      error.statusCode
    );
  }

  if (error.name === "ValiError" || error.message.includes("validation")) {
    logger.warn("Validation error encountered", logContext, error);
    return ctx.json(
      {
        success: false,
        message: "Some submitted fields are incomplete or invalid. Please check your data and try again.",
        error: "VALIDATION_ERROR",
      },
      400
    );
  }

  logger.error("Unhandled server exception caught in router", logContext, error);

  return ctx.json(
    {
      success: false,
      message: "We encountered an unexpected server issue. Our team is already looking into it. Please try again soon.",
      error: "INTERNAL_SERVER_ERROR",
    },
    500
  );
};
```
