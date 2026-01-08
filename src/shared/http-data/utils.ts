import { getSourceFields } from "../model/builders/source";
import { Constructor } from "@/types/constructor";
import { AuthRequest } from "@/types/request";
import { DECORATORS } from "@nestjs/swagger/dist/constants";

export function getApiPropertyMetadata(target: any, key: string) {
  return Reflect.getMetadata(
    DECORATORS.API_MODEL_PROPERTIES,
    target.prototype,
    key
  );
}

export function getAllSources(target: Constructor<any>) {
  let current = target;
  const result: ReturnType<typeof getSourceFields> = [];

  while (current && current !== Object.prototype) {
    const meta = getSourceFields(current);
    result.push(...meta);

    current = Object.getPrototypeOf(current);
  }

  return result;
}

export function isClassType(dto: any, key: string) {
  const type = Reflect.getMetadata("design:type", dto.prototype, key);
  if (!type) return false;

  const primitives = [String, Number, Boolean, Array, Object];
  return !primitives.includes(type);
}

function extractKey(key: string, object: any) {
  const keys = key.split(".");
  if (keys.length === 1) return object?.[keys[0]];
  return extractKey(keys.slice(1).join("."), object?.[keys[0]]);
}

export function collectDataForDTO(DtoClass: Constructor<any>, request: AuthRequest, parent: string = "") {
  const sources = getAllSources(DtoClass);
  const instanceData: Record<string, any> = {};

  for (const { key, source, as } of sources) {
    if (isClassType(DtoClass, key)) {
      const fieldType = Reflect.getMetadata("design:type", DtoClass.prototype, key);
      instanceData[key] = collectDataForDTO(fieldType, request, `${key}.`);
      continue;
    }

    if (source === "body") instanceData[as] = extractKey(parent + key, request.body);
    if (source === "query") instanceData[as] = extractKey(parent + key, request.query);
    if (source === "params") instanceData[as] = extractKey(parent + key, request.params);
    if (source === "apiKey") instanceData[as] = extractKey(parent + key, request.apiKey);
  }
  return instanceData;
}
