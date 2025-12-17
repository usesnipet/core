import { Permissions } from "@/shared/controller/decorators/permissions";
import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { can, numberToPermissions } from "@/lib/permissions";
import { AuthRequest } from "@/types/request";

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const requiredPermissions = this.reflector.get(Permissions, context.getHandler());

    const { apiKey } = request;
    if (!apiKey) throw new UnauthorizedException();
    if (apiKey.root) return true;

    const permissions = numberToPermissions(apiKey.permissions);

    if (!can(permissions, requiredPermissions)) {
      throw new ForbiddenException("You don't have permission to access this resource");
    }
    return true;
  }
}
