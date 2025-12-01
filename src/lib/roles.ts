import { loadRoles } from "@snipet/permission";

export enum Permission {
  CREATE_KNOWLEDGE = 1 << 0,
  READ_KNOWLEDGE = 1 << 1,
  UPDATE_KNOWLEDGE = 1 << 2,
  DELETE_KNOWLEDGE = 1 << 3,

  CREATE_INTEGRATION = 1 << 4,
  READ_INTEGRATION = 1 << 5,
  UPDATE_INTEGRATION = 1 << 6,
  DELETE_INTEGRATION = 1 << 7,

  CREATE_ROLE = 1 << 8,
  READ_ROLE = 1 << 9,
  UPDATE_ROLE = 1 << 10,
  DELETE_ROLE = 1 << 11,

  CREATE_CONNECTOR = 1 << 12,
  READ_CONNECTOR = 1 << 13,
  UPDATE_CONNECTOR = 1 << 14,
  DELETE_CONNECTOR = 1 << 15,

  RUN_CONNECTOR = 1 << 16,
}

export default loadRoles([
  {
    key: "admin",
    name: "Admin",
    permissions: Object.values(Permission) as number[],
    scope: "global",
  }
]);