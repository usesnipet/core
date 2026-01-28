import { __root } from '@/root';
import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import path from 'path';

/**
 * A custom logger that extends NestJS's `ConsoleLogger` to also write logs to a file.
 * Log messages are appended to a specified log file in the application's root directory.
 */
export class FileLogger extends ConsoleLogger {
  /**
   * Creates an instance of FileLogger.
   * @param logFile The name of the log file. Defaults to 'app.log'.
   */
  constructor(private logFile = 'app.log') {
    super()
  }

  /**
   * Appends a message to the log file.
   * @param message The message to write to the file.
   */
  private writeToFile(message: string) {
    fs.appendFileSync(path.join(__root, this.logFile), message + '\n');
  }

  /**
   * Writes a 'log' level message to the console and the log file.
   * @param message The message to log.
   */
  override log(message: string) {
    this.writeToFile(`[LOG] ${message}`);
    super.log(message);
  }

  /**
   * Writes an 'error' level message to the console and the log file.
   * @param message The error message.
   * @param trace The stack trace associated with the error.
   */
  override error(message: string, trace?: string) {
    this.writeToFile(`[ERROR] ${message} - ${trace}`);
    super.error(message, trace);
  }

  /**
   * Writes a 'warn' level message to the console and the log file.
   * @param message The warning message.
   */
  override warn(message: string) {
    this.writeToFile(`[WARN] ${message}`);
    super.warn(message);
  }
}
