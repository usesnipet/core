import { Result, err, ok } from "neverthrow";
import { RegistryError } from "./errors/registry.error";
import { Validator } from "@/validation/validator";
import { Constructable } from "@/types";
import { ClassValidator } from "@/validation/class-validator";

/**
 * Abstract base class for registries that manage collections of items identified by string ids.
 * Provides item registration, retrieval, and listing, with Zod schema validation and error handling.
 *
 * @typeParam T - The type of item managed by the registry. Must have an 'id' property of type string.
 */
export abstract class BaseRegistry<T extends { id: string }> {
  /**
   * Internal storage of items, keyed by their id.
   */
  protected items: Record<string, T> = {};

  protected validator: Validator<T>;
  protected name: string;
  /**
   * Creates a new registry.
   * @param validator - A runtime validator to validate registered items.
   * @param name - The name of the registry type, used in error messages.
   */
  constructor(cls: Constructable<T>) {
    this.validator = new ClassValidator(cls);
    this.name = cls.name;
  }

  /**
   * Registers a new item after schema validation.
   *
   * @param item - The item to register.
   * @returns An error result if validation fails, otherwise void.
   */
  async register(item: T): Promise<Result<void, RegistryError>> {
    const result = await this.validator.validate(item);
    if (!result.ok) return err(new RegistryError(`${this.name} is invalid: ${result.message}`));
    this.items[result.value.id] = result.value;
    return ok(undefined);
  }

  /**
   * Retrieves an item by id.
   *
   * @param id - The id of the item to retrieve.
   * @returns A Result containing the item if found, or a RegistryError if not found.
   */
  get(id: string): Result<T, RegistryError> {
    const item = this.items[id];
    if (!item) return err(new RegistryError(`${this.name} not found: ${id}`));
    return ok(item);
  }

  /**
   * Lists all registered items.
   *
   * @returns A Result containing an array of all registered items.
   */
  list(): Result<T[], RegistryError> {
    return ok(Object.values(this.items));
  }
}