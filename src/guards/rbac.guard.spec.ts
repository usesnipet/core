import { ApiKeyEntity } from "@/entities";
import { Permissions } from "@/shared/controller/decorators";
import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";

import { RBACGuard } from "./rbac.guard";

describe('RBACGuard', () => {
  let guard: RBACGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockApiKey = new ApiKeyEntity({
    id: '1',
    key: 'test-key',
    keyHash: 'hashed-key',
    name: 'Test Key',
    permissions: 1, // READ permission
    rateLimit: 100,
    revoked: false,
    root: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockRootApiKey = new ApiKeyEntity({
    ...mockApiKey,
    root: true,
  });

  const createContext = (apiKey?: ApiKeyEntity, requiredPermissions?: number) => {
    const request = {
      apiKey,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;

    const mockReflectorGet = jest.spyOn(reflector, 'get');
    mockReflectorGet.mockReturnValue(requiredPermissions);

    return { context, request };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RBACGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RBACGuard>(RBACGuard);
    reflector = module.get(Reflector);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no API key is provided', async () => {
      const { context } = createContext();
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should allow access for root API key regardless of permissions', async () => {
      const requiredPermissions = 2; // WRITE permission
      const { context } = createContext(mockRootApiKey, requiredPermissions);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(Permissions, context.getHandler());
    });

    it('should allow access when API key has required permissions', async () => {
      const requiredPermissions = 1; // READ permission
      const { context } = createContext(mockApiKey, requiredPermissions);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(Permissions, context.getHandler());
    });

    it('should throw ForbiddenException when API key lacks required permissions', async () => {
      const requiredPermissions = 2; // WRITE permission
      const { context } = createContext(mockApiKey, requiredPermissions);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      expect(reflector.get).toHaveBeenCalledWith(Permissions, context.getHandler());
    });

    it('should allow access when no permissions are required', async () => {
      const { context } = createContext(mockApiKey, undefined);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(Permissions, context.getHandler());
    });
  });
});
