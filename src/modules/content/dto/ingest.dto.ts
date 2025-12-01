import { Field } from "@/shared/model";

export class IngestDto {
  @Field({ type: "file", required: true })
  file: Express.Multer.File;

  @Field({ type: "string", required: false, nullable: true, transform: (v) => JSON.parse(v) })
  metadata: Record<string, any>;

  @Field({ type: "string", required: true, uuid: true })
  knowledgeId: string;

  @Field({ type: "string", required: true, uuid: true })
  connectorId: string;

  @Field({ type: "string", required: false, nullable: true, uuid: true })
  externalId?: string | null;
}

export class IngestResponseDto {
  @Field({ type: "string", required: true, uuid: true })
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}