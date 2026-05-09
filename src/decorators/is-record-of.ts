import { plainToInstance } from "class-transformer";
import { registerDecorator, ValidationArguments, ValidationOptions, validateSync } from "class-validator";

export function IsRecordOf<T extends object>(
  cls: new () => T,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isRecordOf",
      target: object.constructor,
      propertyName,
      constraints: [cls],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null) return true;
          if (typeof value !== "object" || Array.isArray(value)) return false;

          for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            if (typeof k !== "string" || k.length === 0) return false;
            if (v === null || v === undefined) return false;
            const inst = plainToInstance(cls, v as object);
            if (inst == null || typeof inst !== "object") return false;
            const errs = validateSync(inst as object, { whitelist: true, forbidUnknownValues: false });
            if (errs.length) return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a record of ${cls.name}`;
        },
      },
    });
  };
}

