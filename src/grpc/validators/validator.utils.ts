import * as grpc from '@grpc/grpc-js';
import { plainToClass } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export async function validateRequest<T extends object>(dto: new () => T, request: unknown): Promise<ValidationResult> {
  const instance = plainToClass(dto, request);
  const errors = await validate(instance);

  if (errors.length > 0) {
    return {
      isValid: false,
      errors: flattenValidationErrors(errors),
    };
  }

  return { isValid: true };
}

function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  function extractMessages(error: ValidationError, prefix = ''): void {
    const propertyPath = prefix ? `${prefix}.${error.property}` : error.property;

    if (error.constraints) {
      for (const message of Object.values(error.constraints)) {
        messages.push(`${propertyPath}: ${message}`);
      }
    }

    if (error.children && error.children.length > 0) {
      for (const child of error.children) {
        extractMessages(child, propertyPath);
      }
    }
  }

  for (const error of errors) {
    extractMessages(error);
  }

  return messages;
}

export function createValidationError(errors: string[]): grpc.ServiceError {
  const message = `Invalid request parameters: ${errors.join(', ')}`;
  const error = new Error(message);
  return Object.assign(error, {
    code: grpc.status.INVALID_ARGUMENT,
    details: message,
    metadata: new grpc.Metadata(),
  });
}
