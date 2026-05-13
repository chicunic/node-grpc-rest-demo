import * as grpc from "@grpc/grpc-js";

import { createStructuredLogger } from "../config/logger.js";
import { ConflictError, NotFoundError, ValidationError } from "./errors.js";

const logger = createStructuredLogger("error-handler");

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

function classifyGrpcStatus(error: unknown): grpc.status {
  if (error instanceof NotFoundError) return grpc.status.NOT_FOUND;
  if (error instanceof ValidationError) return grpc.status.INVALID_ARGUMENT;
  if (error instanceof ConflictError) return grpc.status.ALREADY_EXISTS;
  // Backward-compatible fallback for plain Errors thrown by validators
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("not found")) return grpc.status.NOT_FOUND;
    if (message.includes("invalid")) return grpc.status.INVALID_ARGUMENT;
  }
  return grpc.status.INTERNAL;
}

export function handleGrpcError<T>(error: unknown, callback: grpc.sendUnaryData<T>, context: string): void {
  logger.error(`gRPC Error in ${context}`, error);

  callback({ code: classifyGrpcStatus(error), message: getErrorMessage(error) });
}
