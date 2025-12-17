import {
  can, mergePermissions, numberToPermissions, Permission, permissionsToNumber, roles, rootRole
} from "@/lib/permissions";

describe('Permissions', () => {
  // Test to verify if permissions are correctly defined
  test('should have the correct permissions defined', () => {
    expect(Permission.CREATE_KNOWLEDGE).toBe(1 << 0);
    expect(Permission.READ_KNOWLEDGE).toBe(1 << 1);
    expect(Permission.UPDATE_KNOWLEDGE).toBe(1 << 2);
    expect(Permission.DELETE_KNOWLEDGE).toBe(1 << 3);
    expect(Permission.CREATE_INTEGRATION).toBe(1 << 4);
    expect(Permission.READ_INTEGRATION).toBe(1 << 5);
    expect(Permission.UPDATE_INTEGRATION).toBe(1 << 6);
    expect(Permission.DELETE_INTEGRATION).toBe(1 << 7);
    expect(Permission.CREATE_API_KEY).toBe(1 << 8);
    expect(Permission.READ_API_KEY).toBe(1 << 9);
    expect(Permission.UPDATE_API_KEY).toBe(1 << 10);
    expect(Permission.DELETE_API_KEY).toBe(1 << 11);
    expect(Permission.CREATE_CONNECTOR).toBe(1 << 12);
    expect(Permission.READ_CONNECTOR).toBe(1 << 13);
    expect(Permission.UPDATE_CONNECTOR).toBe(1 << 14);
    expect(Permission.DELETE_CONNECTOR).toBe(1 << 15);
    expect(Permission.CREATE_SESSION).toBe(1 << 16);
    expect(Permission.READ_SESSION).toBe(1 << 17);
    expect(Permission.UPDATE_SESSION).toBe(1 << 18);
    expect(Permission.DELETE_SESSION).toBe(1 << 19);
    expect(Permission.RUN_CONNECTOR).toBe(1 << 20);
  });

  // Test to verify if utility functions are available
  test('should export the utility functions', () => {
    expect(typeof can).toBe('function');
    expect(typeof mergePermissions).toBe('function');
    expect(typeof numberToPermissions).toBe('function');
    expect(typeof permissionsToNumber).toBe('function');
  });

  // Test to verify if roles are correctly configured
  test('should have the correct roles configured', () => {
    expect(Array.isArray(roles)).toBe(true);
    expect(roles.length).toBe(2);

    const adminRole = roles.find(r => r.key === 'admin');
    const userRole = roles.find(r => r.key === 'user');

    expect(adminRole).toBeDefined();
    expect(userRole).toBeDefined();

    // Verify admin role has all permissions
    expect(adminRole?.permissions).toContain(Permission.CREATE_KNOWLEDGE);
    expect(adminRole?.permissions).toContain(Permission.RUN_CONNECTOR);

    // Verify user role has no permissions by default
    expect(userRole?.permissions).toHaveLength(0);

    // Verify rootRole is the admin role
    expect(rootRole).toBe(adminRole);
  });

  // Tests for the 'can' function
  describe('can function', () => {
    test('should return true for admin with any permission', () => {
      const adminRole = roles.find(r => r.key === 'admin')!;
      // Using permissions directly since admin has all permissions
      expect(can(adminRole.permissions, Permission.CREATE_KNOWLEDGE)).toBe(true);
      expect(can(adminRole.permissions, Permission.RUN_CONNECTOR)).toBe(true);
    });

    test('should return false for user without permissions', () => {
      const userRole = roles.find(r => r.key === 'user')!;
      expect(can(userRole.permissions, Permission.CREATE_KNOWLEDGE)).toBe(false);
      expect(can(userRole.permissions, Permission.RUN_CONNECTOR)).toBe(false);
    });
  });

  // Tests for permission conversion functions
  describe('permission conversion', () => {
    test('should convert between number and permission array', () => {
      const permissions = [
        Permission.CREATE_KNOWLEDGE,
        Permission.READ_KNOWLEDGE,
        Permission.UPDATE_KNOWLEDGE
      ];

      const permissionsNumber = permissionsToNumber(permissions);
      const convertedBack = numberToPermissions(permissionsNumber);

      // Verify converted permissions match originals
      permissions.forEach(permission => {
        expect(convertedBack).toContain(permission);
      });

      // Verify no extra permissions were added
      expect(convertedBack.length).toBe(permissions.length);
    });

    test('should correctly merge permissions', () => {
      const permissions1 = [Permission.CREATE_KNOWLEDGE, Permission.READ_KNOWLEDGE];
      const permissions2 = [Permission.UPDATE_KNOWLEDGE, Permission.DELETE_KNOWLEDGE];

      const merged = mergePermissions(permissions1, permissions2);

      expect(merged).toContain(Permission.CREATE_KNOWLEDGE);
      expect(merged).toContain(Permission.READ_KNOWLEDGE);
      expect(merged).toContain(Permission.UPDATE_KNOWLEDGE);
      expect(merged).toContain(Permission.DELETE_KNOWLEDGE);
      expect(merged.length).toBe(4);
    });

    test('should remove duplicates when merging permissions', () => {
      const permissions1 = [Permission.CREATE_KNOWLEDGE, Permission.READ_KNOWLEDGE];
      const permissions2 = [Permission.READ_KNOWLEDGE, Permission.UPDATE_KNOWLEDGE];

      const merged = mergePermissions(permissions1, permissions2);

      expect(merged).toContain(Permission.CREATE_KNOWLEDGE);
      expect(merged).toContain(Permission.READ_KNOWLEDGE);
      expect(merged).toContain(Permission.UPDATE_KNOWLEDGE);
      expect(merged.length).toBe(3);
    });
  });
});
