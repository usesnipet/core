import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { Validator } from "./validator";

export type ClassValidatorOptions = {
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  forbidUnknownValues?: boolean;
};

function formatErrors(errors: any[]): string {
  // class-validator error objects can be deeply nested; this keeps messages compact.
  return errors
    .map((e) => {
      const constraints = e?.constraints ? Object.values(e.constraints).join(", ") : "";
      const child = Array.isArray(e?.children) && e.children.length ? `; children: ${formatErrors(e.children)}` : "";
      return `${e?.property ?? "value"}${constraints ? `: ${constraints}` : ""}${child}`;
    })
    .join("; ");
}

export class ClassValidator<T extends object> implements Validator<T> {
  constructor(
    private readonly cls: new () => T,
    private readonly options: ClassValidatorOptions = { whitelist: true, forbidNonWhitelisted: false, forbidUnknownValues: false }
  ) {}

  async validate(value: unknown) {
    const instance = plainToInstance(this.cls, value);
    const errors = await validate(instance as any, {
      whitelist: this.options.whitelist ?? true,
      forbidNonWhitelisted: this.options.forbidNonWhitelisted ?? false,
      forbidUnknownValues: this.options.forbidUnknownValues ?? false,
    });

    if (errors.length) return { ok: false as const, message: formatErrors(errors) };
    return { ok: true as const, value: instance };
  }
}

