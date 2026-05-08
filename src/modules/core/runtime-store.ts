import { Injectable } from "@nestjs/common";
import { Runtime } from "@/core/runtime";

export type StoredRuntime = {
  id: string;
  createdAt: Date;
  flowId?: string;
  runtime: Runtime;
};

@Injectable()
export class RuntimeStore {
  private readonly runtimes = new Map<string, StoredRuntime>();

  set(entry: StoredRuntime): void {
    this.runtimes.set(entry.id, entry);
  }

  get(id: string): StoredRuntime | undefined {
    return this.runtimes.get(id);
  }

  delete(id: string): boolean {
    return this.runtimes.delete(id);
  }
}

