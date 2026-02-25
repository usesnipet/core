import { ApiKeyAssignmentEntity, ApiKeyConnectorPermissionEntity, ApiKeyEntity } from "@/entities";
import { env } from "@/env";
import { permissionsToNumber, rootRole } from "@/lib/permissions";
import { Service } from "@/shared/service";
import {
  Inject, Injectable, Logger, NotFoundException, OnModuleInit, UnauthorizedException
} from "@nestjs/common";
import { EntityManager, FindOptionsWhere, In } from "typeorm";

import { ConnectorService } from "../knowledge/connector/connector.service";

import { CreateApiKeyResponseDto, CreateOrUpdateApiKeyDto } from "./dto/create-or-update-api-key.dto";
import { KnowledgeBaseApiKeyConfig } from "./dto/knowledge-base-api-key-config.dto";

/**
 * Serviço de gerenciamento de chaves API
 *
 * Responsável por gerenciar a criação, atualização e autenticação de chaves API.
 * Inclui:
 * - Geração e validação de chaves
 * - Gerenciamento de permissões e atribuições de conhecimento
 * - Inicialização de chave raiz na primeira execução
 * - Validação de autorização e controle de acesso
 */
@Injectable()
export class ApiKeyService extends Service<ApiKeyEntity> implements OnModuleInit {
  /** Logger para rastrear eventos importantes do serviço */
  logger = new Logger(ApiKeyService.name);

  /** Entidade que este serviço gerencia */
  entity = ApiKeyEntity;

  /** Injeção do serviço de conectores */
  @Inject() private readonly connectorService: ConnectorService;

  apiKeyAssignmentRepository(manager?: EntityManager) {
    return manager ?
      manager.getRepository(ApiKeyAssignmentEntity) :
      this.dataSource.getRepository(ApiKeyAssignmentEntity);
  }

  /**
   * Inicializa o módulo verificando ou criando a chave API raiz
   *
   * Executado automaticamente na inicialização do NestJS.
   * Se nenhuma chave raiz existir:
   * - Gera uma nova chave usando a variável de ambiente ROOT_API_KEY ou gera uma aleatória
   * - Cria uma entidade ApiKeyEntity com role raiz e permissões completas
   * - Salva no banco de dados e registra a chave no log
   */
  async onModuleInit() {
    const rootKey = await this.findFirst({ where: { root: true } });
    if (!rootKey) {
      const key = env.ROOT_API_KEY || ApiKeyEntity.generateKey(env.NODE_ENV);
      const keyHash = ApiKeyEntity.toHash(key);

      const newRootKey = new ApiKeyEntity({
        name: "root",
        key,
        keyHash,
        root: true,
        permissions: permissionsToNumber(rootRole.permissions),
        rateLimit: env.DEFAULT_RATE_LIMIT,
      });

      await this.repository().save(newRootKey);
      this.logger.log(`Root API key created: ${key}`);
    }
  }

  /**
   * Cria uma ou múltiplas novas chaves API
   *
   * O método é sobrecarregado para suportar:
   * - Criação de uma única chave API (retorna CreateApiKeyResponseDto)
   * - Criação de múltiplas chaves API (retorna array de CreateApiKeyResponseDto[])
   *
   * Para cada chave:
   * - Gera uma chave única
   * - Hash da chave é calculado e armazenado
   * - Associações de conhecimento e conectores são criadas
   * - Taxa de limite padrão é atribuída
   *
   * @param input - DTO com dados da chave (nome, bases de conhecimento)
   * @param manager - EntityManager opcional para transações
   * @returns DTO de resposta contendo a chave gerada (uma vez, na criação)
   */
  override async create(input: CreateOrUpdateApiKeyDto, manager?: EntityManager): Promise<CreateApiKeyResponseDto>;
  override async create(input: CreateOrUpdateApiKeyDto[], manager?: EntityManager): Promise<CreateApiKeyResponseDto[]>;
  override async create(
    input: CreateOrUpdateApiKeyDto | CreateOrUpdateApiKeyDto[],
    manager?: EntityManager
  ): Promise<CreateApiKeyResponseDto | CreateApiKeyResponseDto[]> {
    const isArray = Array.isArray(input);
    const dtoList = isArray ? input : [input];

    const apiKeysToCreate = await Promise.all(dtoList.map(async (dto) => {
      const { apiKeyAssignments } = await this.createOrUpdateApiKeyAssignments(dto.knowledgeBases);
      const key = ApiKeyEntity.generateKey(env.NODE_ENV);
      return new ApiKeyEntity({
        name: dto.name,
        key,
        keyHash: ApiKeyEntity.toHash(key),
        rateLimit: env.DEFAULT_RATE_LIMIT,
        apiKeyAssignments
      });
    }));

    if (isArray) {
      const result = await this.repository(manager).save(apiKeysToCreate);
      return result.map(r => CreateApiKeyResponseDto.fromEntity(r, r.key));
    } else {
      const result = await this.repository(manager).save(apiKeysToCreate[0]);
      return CreateApiKeyResponseDto.fromEntity(result, result.key);
    }
  }

  override async update(
    id: string | FindOptionsWhere<ApiKeyEntity>,
    input: CreateOrUpdateApiKeyDto & { skipAccessValidation?: boolean },
    manager?: EntityManager
  ): Promise<void> {
    // Busca a(s) chave(s) API pelo ID fornecido
    let apiKeys = await this.repository(manager).find({ where: typeof id === "string" ? { id } : id });
    if (!apiKeys) {
      throw new NotFoundException(`ApiKey with id ${id} not found`);
    }

    // Atualiza o nome se fornecido
    if (input.name) {
      apiKeys = apiKeys.map(apiKey => (new ApiKeyEntity({ ...apiKey, name: input.name })));
      await this.repository(manager).save(apiKeys);
    }

    // Atualiza as associações de conhecimento e conectores se fornecidas
    if (input.knowledgeBases) {
      const { apiKeyAssignments } = await this.createOrUpdateApiKeyAssignments(
        input.knowledgeBases,
        input.skipAccessValidation
      );
      await this.apiKeyAssignmentRepository(manager).save(apiKeyAssignments);
    }
  }

  /**
   * Valida as permissões de atribuição de chave API
   *
   * Garante que:
   * - O usuário não crie chaves com permissões superiores às suas
   * - Todas as bases de conhecimento atribuídas existem e estão permitidas
   * - Todas as permissões de conector estão dentro do escopo permitido
   *
   * Exceções são levantadas se alguma validação falhar:
   * - Chave não é proprietária de uma base de conhecimento atribuída
   * - Permissões de base de conhecimento excedem as da chave
   * - Recurso, ferramenta ou webhook não estão permitidos
   *
   * @param apiKey - Chave API que está tentando criar/atualizar outra chave
   * @param knowledgeBases - Bases de conhecimento a serem atribuídas
   * @param allowSuper - Se true, pula validações (apenas superusuário)
   * @throws UnauthorizedException - Se validação falhar
   */
  validateApiKeyAssignments(apiKey: ApiKeyEntity, knowledgeBases?: KnowledgeBaseApiKeyConfig[], allowSuper = false) {
    // Chaves raiz e superusuários não precisam de validação
    if (apiKey.root || allowSuper) return;

    const permissionException = new UnauthorizedException("You do not have permission to create/update a api key with a higher permission than the one you have");

    for (const kn of knowledgeBases ?? []) {
      // Verifica se a base de conhecimento está atribuída à chave API
      const apiKeyAssignment = apiKey.apiKeyAssignments?.find(a => a.knowledgeId === kn.knowledgeId);
      if (!apiKeyAssignment) throw permissionException;

      // Verifica se as permissões da base de conhecimento não excedem as da chave API
      if (apiKeyAssignment.kbPermissions < kn.permissions) throw permissionException;

      // Valida permissões de conector para cada um
      for (const cp of kn.connectorPermissions ?? []) {
        // Verifica se o conector está atribuído à chave API
        const connectorPermission = apiKeyAssignment.connectorPermissions?.find(c => c.connectorId === cp.connectorId);
        if (!connectorPermission) throw permissionException;

        // Valida que os recursos, ferramentas e eventos de webhook não excedem o permitido
        if (cp.resources?.some(r => !connectorPermission.resources?.includes(r))) throw permissionException;
        if (cp.tools?.some(t => !connectorPermission.tools?.includes(t))) throw permissionException;
        if (cp.webhookEvents?.some(e => !connectorPermission.webhookEvents?.includes(e))) throw permissionException;
      }
    }
  }

  /**
   * Cria ou atualiza as atribuições de chave API para bases de conhecimento
   *
   * Processo:
   * 1. Valida permissões da chave API atual
   * 2. Obtém todos os conectores referenciados
   * 3. Cria entidades de atribuição com permissões de conector
   * 4. Captura snapshot do manifesto de integração para auditoria
   *
   * @param knowledgeBases - Bases de conhecimento com suas configurações e permissões
   * @param allowSuper - Se true, pula validações de permissão (apenas admin)
   * @returns Objeto contendo array de ApiKeyAssignmentEntity
   * @throws UnauthorizedException - Se validação falhar
   */
  private async createOrUpdateApiKeyAssignments(
    knowledgeBases?: KnowledgeBaseApiKeyConfig[],
    allowSuper = false
  ): Promise<{ apiKeyAssignments: ApiKeyAssignmentEntity[] }> {
    // Obtém a chave API do contexto da requisição
    const apiKey = this.context.apiKey;
    if (!apiKey) throw new UnauthorizedException("You do not have permission to create/update a api key");

    // Valida as permissões antes de prosseguir
    this.validateApiKeyAssignments(apiKey, knowledgeBases, allowSuper);

    const apiKeyAssignments: ApiKeyAssignmentEntity[] = [];

    if (knowledgeBases && knowledgeBases.length > 0) {
      // Extrai todos os IDs de conectores únicos de todas as bases de conhecimento
      const connectorIds = knowledgeBases.flatMap(kb =>
        kb.connectorPermissions?.map(cp => cp.connectorId) ?? []
      );
      const uniqueConnectorIds = [...new Set(connectorIds)];

      // Busca todos os conectores com suas integrações associadas
      const connectors = await this.connectorService.repository().find  ({
        where: { id: In(uniqueConnectorIds) }, relations: ["integration"]
      });

      // Cria atribuições para cada base de conhecimento
      for (const kb of knowledgeBases) {
        const connectorPermissions: ApiKeyConnectorPermissionEntity[] = [];

        if (kb.connectorPermissions) {
          for (const cp of kb.connectorPermissions) {
            // Obtém a integração e seu manifesto para o conector
            const integration = connectors.find(c => c.id === cp.connectorId)?.integration;

            connectorPermissions.push(new ApiKeyConnectorPermissionEntity({
              connectorId: cp.connectorId,
              policyMode: cp.policyMode,
              tools: cp.tools,
              resources: cp.resources,
              webhookEvents: cp.webhookEvents,
              manifestSnapshot: integration?.manifest,
              manifestVersion: integration?.manifest.version
            }));
          }
        }

        // Cria a atribuição de chave API com suas permissões de conector
        apiKeyAssignments.push(new ApiKeyAssignmentEntity({
          knowledgeId: kb.knowledgeId,
          kbPermissions: kb.permissions,
          connectorPermissions: connectorPermissions,
          apiKey
        }));
      }
    }
    return { apiKeyAssignments };
  }

  /**
   * Busca uma chave API pelo valor (string) da chave
   *
   * O método:
   * - Hash do valor fornecido é calculado
   * - Busca no banco por esta chave hash e status não revogado
   * - Carrega as associações de chave e permissões de conector
   *
   * @param apiKeyHeader - Valor da chave API do header HTTP
   * @returns Entidade ApiKeyEntity completa ou undefined se não encontrada
   */
  async getByKey(apiKeyHeader: string) {
    return this.findUnique({
      where: { keyHash: ApiKeyEntity.toHash(apiKeyHeader), revoked: false },
      relations: ["apiKeyAssignments.connectorPermissions"]
    });
  }

  /**
   * Retorna a chave API do usuário atual do contexto
   *
   * Útil para operações de autoidentificação ou verificação de permissões
   *
   * @returns A chave API do contexto da requisição atual
   */
  async self() {
    return this.context.apiKey;
  }
}