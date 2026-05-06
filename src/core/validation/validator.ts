export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export interface Validator<T> {
  validate(value: unknown): Promise<ValidationResult<T>>;
}

