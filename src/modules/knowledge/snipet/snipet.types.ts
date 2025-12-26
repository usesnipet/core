import { SnipetEntity } from "@/entities";
import { SnipetMemoryEntity } from "@/entities/snipet-memory.entity"

export type SnipetContext = {
  memory?: SnipetMemoryEntity[];
  state?: Record<string, any>;
  snipet: SnipetEntity;
}

export type SnipetInput<T, TOptions = Record<string, any>, TMetadata = Record<string, any>> = {
  payload: T;
  options?: TOptions;
  metadata?: TMetadata;
}

export type SnipetOutput<T> = T;

export interface SnipetRuntime<
  TInput,
  TOutput,
  TInputOptions = Record<string, any>,
  TMetadata = Record<string, any>
> {
  execute(
    input: SnipetInput<TInput, TInputOptions, TMetadata>,
    context: SnipetContext
  ): Promise<TOutput>;
}