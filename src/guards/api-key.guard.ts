import { Request, Response } from "express";

import { IS_PUBLIC_KEY } from "@/shared/controller/decorators/public";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleService } from "@/modules/role/role.service";
import { RoleEntity } from "@/entities";
import { AuthRequest } from "@/types/request";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly roleService: RoleService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    const apiKey = request.headers["x-api-key"] as string || request.headers["authorization"] as string;

    const role = await this.roleService.findUnique({
      where: { keyHash: RoleEntity.toHash(apiKey), revoked: false },
      relations: ["roleAssignments.connectorPermissions"]
    });
    if (isPublic) return true;
    if (!role) throw new UnauthorizedException();

    request.role = role;

    return true;
  }
}
