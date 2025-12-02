import { Field } from "@/shared/model";

export enum JobState {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class JobStateResponseDto {
  @Field({ type: "enum", enum: JobState, required: true })
  state: JobState;

  constructor(state: JobState) {
    this.state = state;
  }
}