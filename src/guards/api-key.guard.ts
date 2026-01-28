import { ApiKeyService } from "@/modules/api-key/api-key.service";
import { IS_PUBLIC_KEY } from "@/shared/controller/decorators/public";
import { AuthRequest } from "@/types/request";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/**
 * A guard that validates API keys.
 * It checks for the presence of an API key in the `x-api-key` header and validates it.
 * If the route is marked as public, access is granted even without an API key.
 * If the API key is valid, it is attached to the request object for later use.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector
  ) {}

  /**
   * Determines whether the current request is authorized to proceed.
   *
   * @param context The execution context of the current request.
   * @returns A boolean indicating whether the request is authorized.
   * @throws {UnauthorizedException} If the API key is missing or invalid for a non-public route.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    const apiKeyHeader = request.headers["x-api-key"];
    if ((!apiKeyHeader || Array.isArray(apiKeyHeader)) && !isPublic) throw new UnauthorizedException();

    const apiKey = await this.apiKeyService.getByKey(apiKeyHeader as string);
    if (apiKey) request.apiKey = apiKey;
    if (!apiKey && !isPublic) throw new UnauthorizedException();
    return true;
  }
}
