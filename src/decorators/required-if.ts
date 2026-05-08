import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function RequiredIf(
  property: string,
  condition: (value: any) => boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "requiredIf",
      target: object.constructor,
      propertyName,
      constraints: [property, condition],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [property, condition] = args.constraints;

          const relatedValue = (args.object as any)[property];

          const shouldRequire = condition(relatedValue);

          if (!shouldRequire) {
            return true;
          }

          return value !== undefined &&
            value !== null &&
            value !== "";
        },

        defaultMessage(args: ValidationArguments) {
          const [property] = args.constraints;

          return `${args.property} é obrigatório quando ${property} atender à condição`;
        },
      },
    });
  };
}