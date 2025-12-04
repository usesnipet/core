import { __root } from '@/root';
import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import path from 'path';

export class FileLogger extends ConsoleLogger {
  constructor(private logFile = 'app.log') {
    super()
  }

  private writeToFile(message: string) {
    fs.appendFileSync(path.join(__root, this.logFile), message + '\n');
  }

  override log(message: string) {
    this.writeToFile(`[LOG] ${message}`);
    super.log(message);
  }

  override error(message: string, trace?: string) {
    this.writeToFile(`[ERROR] ${message} - ${trace}`);
    super.error(message, trace);
  }

  override warn(message: string) {
    this.writeToFile(`[WARN] ${message}`);
    super.warn(message);
  }
}
