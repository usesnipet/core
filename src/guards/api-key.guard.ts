import { ApiKeyService } from "@/modules/api-key/api-key.service";
import { IS_PUBLIC_KEY } from "@/shared/controller/decorators/public";
import { AuthRequest } from "@/types/request";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector
  ) {}

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
