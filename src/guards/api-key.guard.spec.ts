import { ApiKeyEntity } from "@/entities";
import { ApiKeyService } from "@/modules/api-key/api-key.service";
import { ExecutionContext, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";

import { ApiKeyGuard } from "./api-key.guard";

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let apiKeyService: jest.Mocked<ApiKeyService>;
  let reflector: jest.Mocked<Reflector>;

  const mockApiKey = 'test-api-key';
  const mockApiKeyEntity = new ApiKeyEntity({
    id: '1',
    key: 'hashed-key',
    name: 'Test Key',
    keyHash: ApiKeyEntity.toHash(mockApiKey),
    rateLimit: 100,
    revoked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        {
          provide: ApiKeyService,
          useValue: {
            getByKey: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    apiKeyService = module.get(ApiKeyService);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockContext = (headers: Record<string, string>, isPublic = false) => {
      const request = {
        headers,
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
          getResponse: () => ({}),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      reflector.getAllAndOverride.mockReturnValue(isPublic);

      return { context, request };
    };

    it('should allow access for public routes', async () => {
      const { context } = mockContext({}, true);
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when no API key is provided', async () => {
      const { context } = mockContext({});
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should validate API key from x-api-key header', async () => {
      const { context, request } = mockContext({ 'x-api-key': mockApiKey });
      apiKeyService.getByKey.mockResolvedValue(mockApiKeyEntity);

      const result = await guard.canActivate(context);

      expect(apiKeyService.getByKey).toHaveBeenCalledWith(mockApiKey);
      expect(request['apiKey']).toEqual(mockApiKeyEntity);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException for invalid API key', async () => {
      const { context } = mockContext({ 'x-api-key': 'invalid-key' });
      apiKeyService.getByKey.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when API key validation throws', async () => {
      const { context } = mockContext({ 'x-api-key': mockApiKey });
      apiKeyService.getByKey.mockRejectedValue(new NotFoundException('Validation error'));

      await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
    });
  });

});