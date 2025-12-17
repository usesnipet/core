import { Permission } from "@/lib/permissions";
import { Constructor } from "@/types/constructor";

export interface ResponseConfig {
  status:      number;
  description: string;
  type?:       Constructor<any>;
  isArray?:    boolean;
}

export interface ControllerResponses {
  findByID?: ResponseConfig[];
  find?:     ResponseConfig[];
  create?:   ResponseConfig[];
  update?:   ResponseConfig[];
  delete?:   ResponseConfig[];
}

export interface RequiredPermissions {
  findByID?: Permission[];
  find?:     Permission[];
  create?:   Permission[];
  update?:   Permission[];
  delete?:   Permission[];
}