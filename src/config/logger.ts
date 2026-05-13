import { LoggingWinston } from "@google-cloud/logging-winston";
import type { Request, Response } from "express";
import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProduction = process.env.NODE_ENV === "production";

const localLogFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  const metaStr = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : "";
  return `${String(timestamp)} ${level}: ${String(stack ?? message)}${metaStr}`;
});

function createLogger(): winston.Logger {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), errors({ stack: true }), json())
        : combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), colorize(), localLogFormat),
    }),
  ];

  if (isProduction) {
    try {
      transports.push(
        new LoggingWinston({
          serviceContext: {
            service: process.env.K_SERVICE ?? "k_service",
            version: process.env.K_REVISION ?? "k_revision",
          },
          redirectToStdout: true,
        }),
      );
    } catch (error) {
      console.warn("Failed to initialize Google Cloud Logging:", error);
    }
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL ?? "info",
    defaultMeta: { environment: process.env.NODE_ENV ?? "development" },
    transports,
    exceptionHandlers: [new winston.transports.Console(), ...(isProduction ? [new LoggingWinston()] : [])],
    rejectionHandlers: [new winston.transports.Console(), ...(isProduction ? [new LoggingWinston()] : [])],
  });
}

const logger = createLogger();

interface StructuredLogger {
  info: (message: string, metadata?: object) => winston.Logger;
  warn: (message: string, metadata?: object) => winston.Logger;
  error: (message: string, error?: Error | object, metadata?: object) => winston.Logger;
  debug: (message: string, metadata?: object) => winston.Logger;
}

export function createStructuredLogger(context: string): StructuredLogger {
  return {
    info: (message, metadata) => logger.info(message, { context, ...metadata }),
    warn: (message, metadata) => logger.warn(message, { context, ...metadata }),
    error: (message, error, metadata) =>
      logger.error(message, {
        context,
        error:
          error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
        ...metadata,
      }),
    debug: (message, metadata) => logger.debug(message, { context, ...metadata }),
  };
}

export function logHttpRequest(req: Request, res: Response, duration?: number): void {
  logger.silly("HTTP Request", {
    method: req.method,
    url: req.url,
    userAgent: req.get("user-agent"),
    ip: req.ip,
    statusCode: res.statusCode,
    duration,
    context: "http-request",
  });
}
