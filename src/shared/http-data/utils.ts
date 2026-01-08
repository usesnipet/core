import { getSourceFields } from "../model/builders/source";
import { Constructor } from "@/types/constructor";
import { AuthRequest } from "@/types/request";

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

export function collectDataForDTO(DtoClass: Constructor<any>, request: AuthRequest) {
  console.log(DtoClass);
  
  const sources = getAllSources(DtoClass);
  console.log(sources);
  
  const instanceData: Record<string, any> = {};

  for (const { key, source } of sources) {

    if (Reflect.getMetadata("design:type", DtoClass.prototype, key)?.prototype) {
      const fieldType = Reflect.getMetadata("design:type", DtoClass.prototype, key);

      instanceData[key] = collectDataForDTO(fieldType, request);
      continue;
    }

    if (source === "body") instanceData[key] = request.body?.[key];
    if (source === "query") instanceData[key] = request.query?.[key];
    if (source === "params") instanceData[key] = request.params?.[key];
    if (source === "apiKey") instanceData[key] = request.apiKey?.[key];
  }

  return instanceData;
}
