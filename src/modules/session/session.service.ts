import { EntityManager, Repository } from "typeorm";

import { SessionContextEntity, SessionContextState, SessionEntity } from "@/entities";
import { Service } from "@/shared/service";
import { Injectable, Logger } from "@nestjs/common";

import { CreateSessionDto } from "./dto/create-session.dto";
import { SubKnowledgeService } from "@/shared/sub-knowledge.service";

export type FindOptions = {
  knowledgeId: string;
  userInput: string;
  metadata?: Record<string, any>;
  forceUsePlugins?: string[]; // list of plugin ids
  excludePlugins?: string[]; // list of plugin ids
}

export type Finder = (...args: any[]) => Partial<FindOptions>;

@Injectable()
export class SessionService extends SubKnowledgeService<SessionEntity> {
  logger = new Logger(SessionService.name);
  entity = SessionEntity;

  //#region repositories
  sessionContextRepository(manager?: EntityManager): Repository<SessionContextEntity> {
    return manager ?
      manager.getRepository(SessionContextEntity) :
      this.dataSource.getRepository(SessionContextEntity);
  }
  //#endregion

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

  async updateSessionContextState(
    sessionId: string,
    state: SessionContextState,
    manager?: EntityManager
  ) {
    return this.sessionContextRepository(manager).update({ sessionId }, { state });
  }
}