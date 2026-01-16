import { Logger, LogLevel } from "@nestjs/common";

export const $log = <T = any>(value: T, options: { type?: LogLevel; logger?: Logger; enabled?: boolean } = {}): T => {
  if (options.enabled === false) return value;

  const { type = 'log', logger = new Logger() } = options;
  logger[type](value);
  return value;
};
