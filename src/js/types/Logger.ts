export interface ILogger {
  log(...args: unknown[]): void;

  debug(...args: unknown[]): void;
}
