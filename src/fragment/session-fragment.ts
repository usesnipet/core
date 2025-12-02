import { Field } from '@/shared/model';
import { BaseFragment } from './fragment';

export class SessionFragment extends BaseFragment {
  @Field({ type: "string", required: true })
  role: string;

  @Field({ type: "string", required: true, uuid: true })
  sessionId: string;

  @Field({ type: "string", required: true, uuid: true })
  knowledgeId: string;

  @Field({ type: "object", additionalProperties: true })
  metadata: any;

  constructor(
    f: Omit<SessionFragment, "id" | "createdAt" | "updatedAt"> & { id?: string, createdAt?: Date, updatedAt?: Date }
  ) {
    super(f);
    this.knowledgeId = f.knowledgeId;
    this.role = f.role;
    this.sessionId = f.sessionId;
    this.metadata = f.metadata;
  }

  static fromObject(obj: SessionFragment): SessionFragment {
    return new SessionFragment(obj);
  }
}