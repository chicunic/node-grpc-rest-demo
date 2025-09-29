import * as grpc from '@grpc/grpc-js';
import { Response } from 'express';

import { createStructuredLogger } from '../config/logger';

export interface ErrorResponse {
  error: string;
}

const logger = createStructuredLogger('error-handler');

export function handleRouteError(error: unknown, res: Response<ErrorResponse>, context: string): void {
  logger.error(`Error in ${context}`, error instanceof Error ? error : { error });

  if (error instanceof Error) {
    // Check if error message indicates a not found scenario
    if (error.message.includes('not found') || error.message.includes('Not found')) {
      res.status(404).json({
        error: error.message,
      });
      return;
    }

    // Check if error message indicates invalid input
    if (error.message.includes('invalid') || error.message.includes('Invalid')) {
      res.status(400).json({
        error: error.message,
      });
      return;
    }
  }

  // Default to internal error
  res.status(500).json({
    error: error instanceof Error ? error.message : 'Internal server error',
  });
}

export function handleGrpcError<T>(error: unknown, callback: grpc.sendUnaryData<T>, context: string): void {
  logger.error(`gRPC Error in ${context}`, error instanceof Error ? error : { error });

  if (error instanceof Error) {
    // Check if error message indicates a not found scenario
    if (error.message.includes('not found') || error.message.includes('Not found')) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: error.message,
      });
      return;
    }

    // Check if error message indicates invalid input
    if (error.message.includes('invalid') || error.message.includes('Invalid')) {
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: error.message,
      });
      return;
    }
  }

  // Default to internal error
  callback({
    code: grpc.status.INTERNAL,
    message: error instanceof Error ? error.message : 'Internal server error',
  });
}
