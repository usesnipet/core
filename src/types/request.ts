import { ApiKeyEntity } from "@/entities";
import { Request } from "express";

export type AuthRequest = Request & {
 apiKey: ApiKeyEntity;
}