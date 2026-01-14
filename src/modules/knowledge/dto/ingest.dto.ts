import { Field } from "@/shared/model";

export class FileIngestDto {
  @Field({ type: "string", required: true, uuid: true, source: "params" })
  knowledgeId: string;

  @Field({ type: "string", required: false, transform: (v) => JSON.parse(v) })
  metadata: Record<string, any>;

  @Field({ type: "string", required: false })
  externalId?: string;

  @Field({
    type: "boolean",
    required: false,
    description: "Indicates if the file should be saved in the storage"
  })
  saveFile: boolean = true;
}

export class FileIngestResponseDto {
  @Field({ type: "string", required: true, uuid: true })
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}