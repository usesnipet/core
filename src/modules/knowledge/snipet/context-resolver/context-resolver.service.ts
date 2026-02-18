import { Inject, Injectable } from "@nestjs/common";
import { Memory, SnipetContextRequest, SnipetResolvedContext } from "./context-resolver.types";
import { SnipetContextResolver } from "./snipet.resolver";
import { KnowledgeContextResolver } from "./knowledge.resolver";
import { Subscriber } from "rxjs";
import { ExecutionEvent } from "../types/execution-event";

@Injectable()
export class ContextResolver {
  @Inject() private readonly snipetContextResolver: SnipetContextResolver;
  @Inject() private readonly knowledgeContextResolver: KnowledgeContextResolver;

  async resolve(
    req: SnipetContextRequest,
    subscriber: Subscriber<ExecutionEvent>,
  ): Promise<SnipetResolvedContext> {
    subscriber.next({ event: "context.start" });
    const useKnowledge = req.executeSnipetOptions?.knowledgeOptions?.use;
    const useSnipet = req.executeSnipetOptions?.snipetOptions?.use;
    const res: SnipetResolvedContext = {
      knowledge: [],
      snipet: [],
      lastNMemories: []
    }
    if (useKnowledge) {
      subscriber.next({ event: "context.read-knowledge" });
      const knowledgeContext = await this.knowledgeContextResolver.resolve(
        req.snipet.knowledgeId,
        req.query,
        {
          filters: req.executeSnipetOptions?.knowledgeOptions?.filters,
          metadata: req.executeSnipetOptions?.knowledgeOptions?.metadata ?? {},
          topK: req.executeSnipetOptions?.knowledgeOptions?.topK ?? 10,
        }
      );
      res.knowledge.push(...knowledgeContext.map(v => ({
        id: v.id,
        content: v.content,
        updatedAt: v.updatedAt,
        createdAt: v.createdAt,
        metadata: v.metadata,
        source: {
          type: "knowledge",
          knowledgeId: req.snipet.knowledgeId,
        }
      } as Memory)))
      subscriber.next({ event: "context.retrieved-knowledge", payload: res.knowledge });
    }

    if (useSnipet) {
      subscriber.next({ event: "context.read-snipet" });
      const snipetContext = await this.snipetContextResolver.resolve(
        req.snipet.knowledgeId,
        req.snipet.id,
        {
          query: { query: req.query, topK: req.executeSnipetOptions?.snipetOptions?.topK ?? 10 },
          filters: req.executeSnipetOptions?.snipetOptions?.filters,
          lastNMemories: req.executeSnipetOptions?.snipetOptions?.lastNMemories,
        }
      )
      res.snipet.push(...snipetContext.query.map(v => ({
        id: v.id,
        content: v.content,
        updatedAt: v.updatedAt,
        createdAt: v.createdAt,
        metadata: v.metadata,
        source: {
          type: "snipet",
          snipetId: v.id,
          knowledgeId: v.knowledgeId
        }
      } as Memory)));

      res.lastNMemories.push(...snipetContext.lastNMemories.map(v => ({
        id: v.id,
        content: v.content?.text,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        source: {
          type: "snipet",
          knowledgeId: v.knowledgeId,
          snipetId: v.id,
        },
      } as Memory)));
      subscriber.next({ event: "context.retrieved-snipet", payload: [...res.snipet, ...res.lastNMemories] });
    }
    console.log(res);
    return res;
  }
}
