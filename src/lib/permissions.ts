/**
 * @file Defines the permission system for the application.
 * It uses a bitwise approach to represent and manage permissions, allowing for efficient checks and combinations.
 * Roles are defined with specific sets of permissions.
 */

import { loadRoles } from "@snipet/permission";

/**
 * Enum representing the various permissions available in the system.
 * Each permission is a unique power of 2, allowing them to be combined and checked using bitwise operations.
 */
export enum Permission {
  /** Allows creating knowledge bases. */
  CREATE_KNOWLEDGE = 1 << 0,
  /** Allows reading knowledge bases. */
  READ_KNOWLEDGE = 1 << 1,
  /** Allows updating knowledge bases. */
  UPDATE_KNOWLEDGE = 1 << 2,
  /** Allows deleting knowledge bases. */
  DELETE_KNOWLEDGE = 1 << 3,

  /** Allows creating integrations. */
  CREATE_INTEGRATION = 1 << 4,
  /** Allows reading integrations. */
  READ_INTEGRATION = 1 << 5,
  /** Allows updating integrations. */
  UPDATE_INTEGRATION = 1 << 6,
  /** Allows deleting integrations. */
  DELETE_INTEGRATION = 1 << 7,

  /** Allows creating API keys. */
  CREATE_API_KEY = 1 << 8,
  /** Allows reading API keys. */
  READ_API_KEY = 1 << 9,
  /** Allows updating API keys. */
  UPDATE_API_KEY = 1 << 10,
  /** Allows deleting API keys. */
  DELETE_API_KEY = 1 << 11,

  /** Allows creating connectors. */
  CREATE_CONNECTOR = 1 << 12,
  /** Allows reading connectors. */
  READ_CONNECTOR = 1 << 13,
  /** Allows updating connectors. */
  UPDATE_CONNECTOR = 1 << 14,
  /** Allows deleting connectors. */
  DELETE_CONNECTOR = 1 << 15,

  /** Allows creating snipets. */
  CREATE_SNIPET = 1 << 16,
  /** Allows reading snipets. */
  READ_SNIPET = 1 << 17,
  /** Allows updating snipets. */
  UPDATE_SNIPET = 1 << 18,
  /** Allows deleting snipets. */
  DELETE_SNIPET = 1 << 19,

  /** Allows running a connector. */
  RUN_CONNECTOR = 1 << 20,
}

// The `loadRoles` function (from `@snipet/permission`) likely initializes roles and permission-related utilities.
const { can, mergePermissions, numberToPermissions, permissionsToNumber, roles } = loadRoles([
  {
    key: "admin",
    name: "Admin",
    // The admin role has all permissions defined in the Permission enum.
    permissions: Object.values(Permission) as number[],
    scope: "global"
  },
  {
    key: "user",
    name: "User",
    // The user role starts with no permissions by default.
    permissions: [],
    scope: "global"
  }
]);

/** The root role, typically the 'admin', which has all permissions. */
const rootRole = roles.find(r => r.key === "admin")!;

/**
 * A utility to check if a set of permissions includes the required permissions.
 * @example can(userPermissions, [Permission.READ_KNOWLEDGE])
 */
/**
 * A utility to combine multiple permission sets into one.
 */
/**
 * A utility to convert a bitwise number into an array of Permission enums.
 */
/**
 * A utility to convert an array of Permission enums into a single bitwise number.
 */
/**
 * The list of all defined roles.
 */
/**
 * The 'admin' role object, which has the highest level of access.
 */
export {
  can,
  mergePermissions,
  numberToPermissions,
  permissionsToNumber,
  roles,
  rootRole
};
