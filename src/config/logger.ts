import { LoggingWinston } from '@google-cloud/logging-winston';
import { Request, Response } from 'express';
import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom log format for local development
const localLogFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  const metaStr = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : '';
  return `${timestamp} ${level}: ${stack ?? message}${metaStr}`;
});

// Create logger instance
// Environment-based configuration:
// - Development: Console with colors, no service metadata
// - Production: Console with JSON + Google Cloud Logging with K_SERVICE/K_REVISION
const createLogger = (): winston.Logger => {
  const transports: winston.transport[] = [];

  // Always add console transport
  transports.push(
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? combine(timestamp(), errors({ stack: true }), json())
          : combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), colorize(), localLogFormat),
    })
  );

  // Add Google Cloud Logging in production
  if (process.env.NODE_ENV === 'production') {
    try {
      const loggingWinston = new LoggingWinston({
        // Service context for better log organization
        serviceContext: {
          service: process.env.K_SERVICE ?? 'k_service',
          version: process.env.K_REVISION ?? 'k_revision',
        },

        // Redirect console logs to Cloud Logging
        redirectToStdout: true,
      });

      transports.push(loggingWinston);
    } catch (error) {
      console.warn('Failed to initialize Google Cloud Logging:', error);
    }
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL ?? 'info',
    defaultMeta: {
      environment: process.env.NODE_ENV ?? 'development',
    },
    transports,

    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
      new winston.transports.Console(),
      ...(process.env.NODE_ENV === 'production' ? [new LoggingWinston()] : []),
    ],

    rejectionHandlers: [
      new winston.transports.Console(),
      ...(process.env.NODE_ENV === 'production' ? [new LoggingWinston()] : []),
    ],
  });
};

export const logger = createLogger();

// Structured logging helpers
export const createStructuredLogger = (
  context: string
): {
  info: (message: string, metadata?: object) => winston.Logger;
  warn: (message: string, metadata?: object) => winston.Logger;
  error: (message: string, error?: Error | object, metadata?: object) => winston.Logger;
  debug: (message: string, metadata?: object) => winston.Logger;
} => ({
  info: (message: string, metadata?: object) => logger.info(message, { context, ...metadata }),

  warn: (message: string, metadata?: object) => logger.warn(message, { context, ...metadata }),

  error: (message: string, error?: Error | object, metadata?: object) =>
    logger.error(message, {
      context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      ...metadata,
    }),

  debug: (message: string, metadata?: object) => logger.debug(message, { context, ...metadata }),
});

// HTTP request logging helper
export const logHttpRequest = (req: Request, res: Response, duration?: number): void => {
  logger.silly('HTTP Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('user-agent'),
    ip: req.ip,
    statusCode: res.statusCode,
    duration,
    context: 'http-request',
  });
};

// gRPC request logging helper
export const logGrpcRequest = (
  method: string,
  metadata: Record<string, unknown>,
  duration?: number,
  error?: Error
): void => {
  const logData = {
    method,
    metadata: metadata ?? {},
    duration,
    context: 'grpc-request',
  };

  if (error) {
    logger.error(`gRPC Error: ${method}`, {
      ...logData,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  } else {
    logger.silly(`gRPC Request: ${method}`, logData);
  }
};

export default logger;
