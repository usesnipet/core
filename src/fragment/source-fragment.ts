import { Field } from "@/shared/model";

import { BaseFragment } from "./fragment";

export class SourceFragment extends BaseFragment {
  @Field({ type: "number", positive: true, required: false })
  seqId?: number;

  @Field({ type: "string", required: true, uuid: true })
  knowledgeId: string;

  @Field({ type: "string", required: true, uuid: true })
  sourceId: string;

  @Field({ type: "string", required: true, description: "The type of the source" })
  sourceType: string;

  @Field({ type: "object", additionalProperties: true })
  metadata: any;

  constructor(
    f: Omit<SourceFragment, "id" | "createdAt" | "updatedAt"> & {
      id?: string, createdAt?: Date, updatedAt?: Date
    }
  ) {
    super(f);
    this.knowledgeId = f.knowledgeId;
    this.sourceType = f.sourceType;
    this.metadata = f.metadata;
    this.sourceId = f.sourceId;
    this.seqId = f.seqId;
    this.metadata = f.metadata;
  }

  static fromObject(obj: any): SourceFragment {
    return new SourceFragment(obj);
  }
}
