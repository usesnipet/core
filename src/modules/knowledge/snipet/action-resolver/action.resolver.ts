import { Injectable } from "@nestjs/common";
import { ActionResolved, ActionResolverRequest } from "./action-resolver.types";

@Injectable()
export class ActionResolver {
  async resolve(req: ActionResolverRequest): Promise<ActionResolved> {
    return {
      actions: [],
    }
  }
}