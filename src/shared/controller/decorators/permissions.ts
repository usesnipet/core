import { Permission } from "@/lib/roles";
import { Reflector } from "@nestjs/core";

export const Permissions = Reflector.createDecorator<Permission[]>();
