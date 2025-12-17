import { Response } from "express";

import { IS_PUBLIC_KEY } from "@/shared/controller/decorators/public";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ApiKeyService } from "@/modules/api-key/api-key.service";
import { ApiKeyEntity } from "@/entities";
import { AuthRequest } from "@/types/request";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    const apiKeyHeader = request.headers["x-api-key"] as string || request.headers["authorization"] as string;

    const apiKey = await this.apiKeyService.findUnique({
      where: { keyHash: ApiKeyEntity.toHash(apiKeyHeader), revoked: false },
      relations: ["apiKeyAssignments.connectorPermissions"]
    });
    if (isPublic) return true;
    if (!apiKey) throw new UnauthorizedException();

    request.apiKey = apiKey;

    return true;
  }
}
