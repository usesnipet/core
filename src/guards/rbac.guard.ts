import { Permissions } from "@/shared/controller/decorators/permissions";
import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { can, numberToPermissions } from "@/lib/permissions";
import { AuthRequest } from "@/types/request";

/**
 * A guard for Role-Based Access Control (RBAC).
 * It checks if the API key associated with the request has the necessary permissions to access the route.
 * This guard should be used after the ApiKeyGuard, as it relies on the `apiKey` property being present on the request.
 * Root users (apiKey.root === true) are always granted access.
 */
@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines whether the current request is authorized based on the required routes permissions.
   *
   * @param context The execution context of the current request.
   * @returns A boolean indicating whether the request is authorized.
   * @throws {UnauthorizedException} If no API key is found on the request.
   * @throws {ForbiddenException} If the apiKey does not have the required permissions.
   */
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
