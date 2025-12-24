import { Field } from '@/shared/model';
import { BaseFragment } from './fragment';

export class SnipetFragment extends BaseFragment {
  @Field({ type: "string", required: true })
  role: string;

  @Field({ type: "string", required: true, uuid: true })
  snipetId: string;

  @Field({ type: "string", required: true, uuid: true })
  knowledgeId: string;

  @Field({ type: "object", additionalProperties: true })
  metadata: any;

  constructor(
    f: Omit<SnipetFragment, "id" | "createdAt" | "updatedAt"> & { id?: string, createdAt?: Date, updatedAt?: Date }
  ) {
    super(f);
    this.knowledgeId = f.knowledgeId;
    this.role = f.role;
    this.snipetId = f.snipetId;
    this.metadata = f.metadata;
  }

  static fromObject(obj: SnipetFragment): SnipetFragment {
    return new SnipetFragment(obj);
  }
}