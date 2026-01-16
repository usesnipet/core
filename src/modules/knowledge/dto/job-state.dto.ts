import { Field } from "@/shared/model";

export enum IngestJobState {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class IngestJobStateResponseDto {
  @Field({ type: "enum", enum: IngestJobState, required: true })
  state: IngestJobState;

  constructor(state: IngestJobState) {
    this.state = state;
  }
}