import { ApiKeyConnectorPermissionEntity, ApiKeyEntity, KbPermission, PolicyMode } from "@/entities";
import { HTTPContext } from "@/shared/http-context/http-context";
import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DataSource, EntityManager, Repository } from "typeorm";

import { ConnectorService } from "../knowledge/connector/connector.service";

import { ApiKeyService } from "./api-key.service";
import { CreateOrUpdateApiKeyDto } from "./dto/create-or-update-api-key.dto";
import { KnowledgeBaseApiKeyConfig } from "./dto/knowledge-base-api-key-config.dto";

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let apiKeyRepository: jest.Mocked<Repository<ApiKeyEntity>>;
  let connectorService: jest.Mocked<ConnectorService>;
  let entityManager: jest.Mocked<EntityManager>;
  let mockHttpContext: any;
  let mockDataSource: jest.Mocked<DataSource>;

  const mockApiKeyEntity = (overrides: Partial<ApiKeyEntity> = {}) => {
    const now = new Date();
    return {
      id: 'test-id',
      name: 'test-key',
      key: 'test-key-value',
      keyHash: 'hashed-test-key',
      root: false,
      revoked: false,
      rateLimit: 1000,
      apiKeyAssignments: [],
      createdAt: now,
      updatedAt: now,
      ...overrides,
    } as unknown as ApiKeyEntity;
  };

  beforeEach(async () => {
    // Create mock HTTPContext
    mockHttpContext = {
      apiKey: null,
      // Add other required properties from HTTPContext
      getRequest: jest.fn(),
      getResponse: jest.fn(),
    };

    // Create mock repository
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      findOneOrFail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    // Create mock DataSource that returns our mock repository
    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      transaction: jest.fn().mockImplementation(callback => callback({
        // Mock transaction manager methods if needed
        getRepository: jest.fn().mockReturnValue(mockRepository)
      })),
      // Add other required DataSource methods
      initialize: jest.fn(),
      destroy: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;
    // Update the test module to use only the DataSource provider
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: HTTPContext,
          useValue: mockHttpContext,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ConnectorService,
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<ApiKeyService>(ApiKeyService);
    // Get the repository from the DataSource mock
    apiKeyRepository = mockDataSource.getRepository(ApiKeyEntity) as any;
    connectorService = module.get(ConnectorService);
    entityManager = module.get(EntityManager);
    // Set up the mock context with a test API key
    mockHttpContext.apiKey = mockApiKeyEntity();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new API key', async () => {
      const createDto: CreateOrUpdateApiKeyDto = {
        name: 'test-key',
        knowledgeBases: [],
      };

      const savedEntity = mockApiKeyEntity();
      jest.spyOn(service as any, 'createOrUpdateApiKeyAssignments').mockResolvedValue({
        apiKeyAssignments: [],
      });

      apiKeyRepository.save.mockResolvedValue(savedEntity);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(apiKeyRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(createDto.name);
    });

    it('should create multiple API keys', async () => {
      const createDtos: CreateOrUpdateApiKeyDto[] = [
        { name: 'key1', knowledgeBases: [] },
        { name: 'key2', knowledgeBases: [] },
      ];

      const savedEntities = [
        mockApiKeyEntity({ name: 'key1' }),
        mockApiKeyEntity({ name: 'key2' }),
      ];

      jest.spyOn(service as any, 'createOrUpdateApiKeyAssignments').mockResolvedValue({
        apiKeyAssignments: [],
      });

      apiKeyRepository.save.mockImplementation((entities) => Promise.resolve(entities as any));

      const result = await service.create(createDtos);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(apiKeyRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing API key', async () => {
      const updateDto: CreateOrUpdateApiKeyDto = {
        name: 'updated-key',
        knowledgeBases: [],
      };

      const existingKey = mockApiKeyEntity();
      apiKeyRepository.find.mockResolvedValue([existingKey]);

      jest.spyOn(service as any, 'createOrUpdateApiKeyAssignments').mockResolvedValue({
        apiKeyAssignments: [],
      });

      await service.update('test-id', updateDto);

      expect(apiKeyRepository.save).toHaveBeenCalled();
      expect(apiKeyRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'updated-key',
          }),
        ])
      );
    });
  });

  describe('validateApiKeyAssignments', () => {
    const now = new Date();

    const highApiKey = mockApiKeyEntity({
      apiKeyAssignments: [
        {
          id: 'assign-1',
          apiKeyId: "test-id",
          createdAt: now,
          updatedAt: now,
          knowledgeId: 'kb1',
          kbPermissions: KbPermission.MANAGE,
          connectorPermissions: [
            {
              id: 'perm-1',
              connectorId: 'conn1',
              apiKeyAssignmentId: 'assign-1',
              policyMode: PolicyMode.ALLOWLIST,
              resources: ['res1'],
              tools: ['tool1'],
              webhookEvents: ['event1'],
              manifestVersion: '1.0.0',
              createdAt: new Date(),
              updatedAt: new Date(),
            } as ApiKeyConnectorPermissionEntity,
          ],
        },
      ],
    });

    const lowApiKey = mockApiKeyEntity({
      apiKeyAssignments: [
        {
          id: 'assignment-1',
          knowledgeId: 'kb1',
          kbPermissions: KbPermission.READ,
          connectorPermissions: [],
          apiKeyId: 'test-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    it('should not throw for valid permissions', () => {
      const knowledgeBases: KnowledgeBaseApiKeyConfig[] = [
        {
          knowledgeId: 'kb1',
          permissions: KbPermission.READ, // Lower permission is okay
          connectorPermissions: [
            {
              connectorId: 'conn1',
              policyMode: PolicyMode.ALLOWLIST, // Same policy mode is okay
              resources: ['res1'],
              tools: ['tool1'],
              webhookEvents: ['event1'],
            },
          ],
        },
      ];

      expect(() => service['validateApiKeyAssignments'](highApiKey, knowledgeBases)).not.toThrow();
    });

    it('should throw for invalid connector permissions (resources)', () => {
      const knowledgeBases: KnowledgeBaseApiKeyConfig[] = [
        {
          knowledgeId: 'kb1',
          permissions: KbPermission.READ, // Lower permission is okay
          connectorPermissions: [
            {
              connectorId: 'conn1',
              policyMode: PolicyMode.ALLOWLIST, // Same policy mode is okay
              resources: ['res1', "res2"],
              tools: ['tool1'],
              webhookEvents: ['event1'],
            },
          ],
        },
      ];

      expect(() => service['validateApiKeyAssignments'](highApiKey, knowledgeBases)).toThrow(UnauthorizedException);
    });

    it('should throw for invalid connector permissions (tools)', () => {
      const knowledgeBases: KnowledgeBaseApiKeyConfig[] = [
        {
          knowledgeId: 'kb1',
          permissions: KbPermission.READ, // Lower permission is okay
          connectorPermissions: [
            {
              connectorId: 'conn1',
              policyMode: PolicyMode.ALLOWLIST, // Same policy mode is okay
              resources: ['res1'],
              tools: ['tool1', "tool2"],
              webhookEvents: ['event1'],
            },
          ],
        },
      ];

      expect(() => service['validateApiKeyAssignments'](highApiKey, knowledgeBases)).toThrow(UnauthorizedException);
    });

    it('should throw for invalid connector permissions (webhookEvents)', () => {
      const knowledgeBases: KnowledgeBaseApiKeyConfig[] = [
        {
          knowledgeId: 'kb1',
          permissions: KbPermission.READ, // Lower permission is okay
          connectorPermissions: [
            {
              connectorId: 'conn1',
              policyMode: PolicyMode.ALLOWLIST, // Same policy mode is okay
              resources: ['res1'],
              tools: ['tool1'],
              webhookEvents: ['event1', "event2"],
            },
          ],
        },
      ];

      expect(() => service['validateApiKeyAssignments'](highApiKey, knowledgeBases)).toThrow(UnauthorizedException);
    });

    it('should throw for invalid knowledge base permissions', () => {
      const knowledgeBases: KnowledgeBaseApiKeyConfig[] = [
        {
          knowledgeId: 'kb1',
          permissions: KbPermission.MANAGE, // Higher permission than allowed
          connectorPermissions: [],
        },
      ];

      expect(() => service['validateApiKeyAssignments'](lowApiKey, knowledgeBases)).toThrow(UnauthorizedException);
    });
  });

  describe('getByKey', () => {
    it('should return API key by its value', async () => {
      const apiKey = mockApiKeyEntity();
      const keyHash = 'hashed-key-value';

      jest.spyOn(ApiKeyEntity, 'toHash').mockReturnValue(keyHash);
      apiKeyRepository.findOne.mockResolvedValue(apiKey);

      const result = await service.getByKey('test-key');

      expect(result).toBe(apiKey);
      expect(apiKeyRepository.findOne).toHaveBeenCalledWith({
        where: { keyHash, revoked: false },
        relations: ['apiKeyAssignments.connectorPermissions'],
      });
    });
  });

  describe('onModuleInit', () => {
    it('should create root API key if not exists', async () => {
      apiKeyRepository.find.mockResolvedValue([]);

      await service.onModuleInit();

      expect(service.repository().save).toHaveBeenCalled();
    });

    it('should not create root API key if already exists', async () => {
      apiKeyRepository.find.mockResolvedValue([mockApiKeyEntity({ root: true })]);

      await service.onModuleInit();

      expect(service.repository().save).not.toHaveBeenCalled();
    });
  });
});
