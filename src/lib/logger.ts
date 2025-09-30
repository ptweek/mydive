import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  browser: {
    asObject: true,
  },
});

export function createLogger(service: string, requestId?: string) {
  return logger.child({
    service,
    requestId: requestId ?? crypto.randomUUID(),
  });
}
