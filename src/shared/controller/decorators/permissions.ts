import { Permission } from "@/lib/permissions";
import { Reflector } from "@nestjs/core";

export const Permissions = Reflector.createDecorator<Permission[]>();
