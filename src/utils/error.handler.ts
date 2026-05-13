import * as grpc from "@grpc/grpc-js";
import type { Response } from "express";

import { createStructuredLogger } from "../config/logger.js";

export interface ErrorResponse {
  error: string;
}

type ErrorType = "not_found" | "invalid" | "internal";

const logger = createStructuredLogger("error-handler");

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

function classifyError(error: unknown): ErrorType {
  if (!(error instanceof Error)) {
    return "internal";
  }

  const message = error.message.toLowerCase();

  if (message.includes("not found")) {
    return "not_found";
  }

  if (message.includes("invalid")) {
    return "invalid";
  }

  return "internal";
}

const HTTP_STATUS_MAP: Record<ErrorType, number> = {
  not_found: 404,
  invalid: 400,
  internal: 500,
};

const GRPC_STATUS_MAP: Record<ErrorType, grpc.status> = {
  not_found: grpc.status.NOT_FOUND,
  invalid: grpc.status.INVALID_ARGUMENT,
  internal: grpc.status.INTERNAL,
};

export function handleRouteError(error: unknown, res: Response<ErrorResponse>, context: string): void {
  logger.error(`Error in ${context}`, error instanceof Error ? error : { error });

  const errorType = classifyError(error);
  const status = HTTP_STATUS_MAP[errorType];
  const message = getErrorMessage(error);

  res.status(status).json({ error: message });
}

export function handleGrpcError<T>(error: unknown, callback: grpc.sendUnaryData<T>, context: string): void {
  logger.error(`gRPC Error in ${context}`, error instanceof Error ? error : { error });

  const errorType = classifyError(error);
  const code = GRPC_STATUS_MAP[errorType];
  const message = getErrorMessage(error);

  callback({ code, message });
}
