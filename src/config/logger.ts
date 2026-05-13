type Severity = "DEBUG" | "INFO" | "WARNING" | "ERROR";

const LEVEL_ORDER: Record<Severity, number> = { DEBUG: 10, INFO: 20, WARNING: 30, ERROR: 40 };

function currentMinLevel(): number {
  const raw = (process.env.LOG_LEVEL ?? "").toUpperCase();
  if (raw in LEVEL_ORDER) return LEVEL_ORDER[raw as Severity];
  if (process.env.NODE_ENV === "test") return LEVEL_ORDER.WARNING;
  return LEVEL_ORDER.INFO;
}

function write(severity: Severity, message: string, data?: Record<string, unknown>): void {
  if (LEVEL_ORDER[severity] < currentMinLevel()) return;
  const entry: Record<string, unknown> = {
    severity,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    ...data,
  };
  process.stdout.write(JSON.stringify(entry) + "\n");
}

function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return error;
}

interface StructuredLogger {
  info: (message: string, metadata?: Record<string, unknown>) => void;
  warn: (message: string, metadata?: Record<string, unknown>) => void;
  error: (message: string, error?: unknown, metadata?: Record<string, unknown>) => void;
  debug: (message: string, metadata?: Record<string, unknown>) => void;
}

export function createStructuredLogger(context: string): StructuredLogger {
  return {
    debug: (message, metadata) => {
      write("DEBUG", message, { context, ...metadata });
    },
    info: (message, metadata) => {
      write("INFO", message, { context, ...metadata });
    },
    warn: (message, metadata) => {
      write("WARNING", message, { context, ...metadata });
    },
    error: (message, error, metadata) => {
      write("ERROR", message, { context, error: serializeError(error), ...metadata });
    },
  };
}
