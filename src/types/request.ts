import { RoleEntity } from "@zilliz/milvus2-sdk-node";
import { Request } from "express";

export type AuthRequest = Request & {
 role: RoleEntity;
}