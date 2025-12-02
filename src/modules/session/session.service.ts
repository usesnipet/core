import { SessionContextEntity, SessionEntity, SessionMessageEntity, SessionMessageRole } from "@/entities";
import { Service } from "@/shared/service";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { KnowledgeService } from "../knowledge/knowledge.service";
import { CacheService } from "@/infra/cache/cache.service";
import { SourceVectorStoreService } from "@/infra/vector/source-vector-store.service";
import { Fragments } from "@/fragment";

export type FindOptions = {
  knowledgeId: string;
  userInput: string;
  metadata?: Record<string, any>;
  forceUsePlugins?: string[]; // list of plugin ids
  excludePlugins?: string[]; // list of plugin ids
}

export type Finder = (...args: any[]) => Partial<FindOptions>;

@Injectable()
export class SessionService extends Service<SessionEntity> {
  logger = new Logger(SessionService.name);
  entity = SessionEntity;


  constructor(
    private readonly vectorStore:      SourceVectorStoreService,
    private readonly knowledgeService: KnowledgeService,
    private readonly cacheService:     CacheService,
  ) {
    super();
  }

  sessionContextRepository(manager?: EntityManager): Repository<SessionContextEntity> {
    return manager ?
      manager.getRepository(SessionContextEntity) :
      this.dataSource.getRepository(SessionContextEntity);
  }

  sessionMessageRepository(manager?: EntityManager): Repository<SessionMessageEntity> {
    return manager ?
      manager.getRepository(SessionMessageEntity) :
      this.dataSource.getRepository(SessionMessageEntity);
  }

  override async create(input: CreateSessionDto, manager?: EntityManager): Promise<SessionEntity>;
  override async create(input: CreateSessionDto[], manager?: EntityManager): Promise<SessionEntity[]>;
  override async create(
    input: CreateSessionDto | CreateSessionDto[],
    manager?: EntityManager
  ): Promise<SessionEntity | SessionEntity[]> {
    return await this.transaction(async (manager) => {
      const isArray = Array.isArray(input);
      const inputArray = isArray ? input : [input];

      const sessions: SessionEntity[] = [];
      for (const input of inputArray) {
        const session = await this.repository(manager).save(new SessionEntity(input));
        session.context = new SessionContextEntity({ sessionId: session.id });
        await this.sessionContextRepository(manager).save(session.context);
        sessions.push(session);
      }
      return isArray ? sessions : sessions[0];
    }, manager);
  }

  async sendMessage({ message, sessionId }: SendMessageDto, manager?: EntityManager): Promise<void> {
    const session = await this.repository(manager).findOne({
      where: { id: sessionId },
      relations: ["context"]
    });
    if (!session) throw new NotFoundException("Session not found");

    const userMessage = await this.sessionMessageRepository(manager).save(new SessionMessageEntity({
      content: message,
      role: SessionMessageRole.USER,
      session
    }));
  }

  async searchInSource(knowledgeId: string, userInput: string, ...opts: Finder[]): Promise<Fragments> {

  }
}