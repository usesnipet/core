import { Result, err, ok } from "neverthrow";
import { RegistryError } from "./errors/registry.error";
import z from "zod";

/**
 * Abstract base class for registries that manage collections of items identified by string ids.
 * Provides item registration, retrieval, and listing, with Zod schema validation and error handling.
 *
 * @typeParam T - The type of item managed by the registry. Must have an 'id' property of type string.
 */
export abstract class Registry<T extends { id: string }> {
  /**
   * Internal storage of items, keyed by their id.
   */
  private items: Record<string, T> = {};

  /**
   * Creates a new registry.
   * @param schema - A Zod schema to validate registered items.
   * @param name - The name of the registry type, used in error messages.
   */
  constructor(
    private readonly schema: z.ZodSchema<T>,
    private readonly name: string
  ) {}

  /**
   * Registers a new item after schema validation.
   *
   * @param item - The item to register.
   * @returns An error result if validation fails, otherwise void.
   */
  register(item: T) {
    const result = this.schema.safeParse(item);
    if (!result.success) return err(new RegistryError(`${this.name} is invalid: ${result.error.message}`));
    this.items[item.id] = item;
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