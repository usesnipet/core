# AJV Module

Library-style Nest module: **no HTTP controller**. Feature modules to validate JSON payloads and apply field-level encryption driven by JSON Schema metadata.

---

## Service

- Name: `AjvSchemaService` (or equivalent; replaces the former `ajvHelper` factory object)
- Description: Compile JSON Schemas with AJV, validate data, encrypt or decrypt values at paths listed in `x-encryptedFields`, and mask those paths for safe API responses
- Shape: Injectable **class** exposing the same responsibilities as the previous helper: validate, encrypt, decrypt, mask

### Dependencies

- SecurityService — encrypt plaintext strings to `SecretRecordModel`; decrypt back to plaintext
- Utilities: `isRecord`, `clone`

### Schema contract

- **`x-encryptedFields`:** array of **dot-path strings** (e.g. `credentials.password`). If missing or not a string array, it is treated as **no encrypted fields**. See extension details in team docs or keep a small `schema-extensions` doc next to this file if you split it again.

### Path resolution (internal)

- Paths are split on `.`, segments trimmed, empty segments dropped.
- For each path, the code walks the object to the **parent** record and the **final key**; if the structure does not support the path, that path is **skipped** (encrypt/decrypt/mask) where the implementation uses `continue` on missing parent.

### Methods

- validate
  - Description: Validate `data` against a JSON Schema instance using AJV (synchronous `Result`, no I/O)
  - Parameters:
    - schema: object — full schema object; **`$schema` is stripped** before `compile` (AJV compile input)
    - data: unknown
  - Logic:
    - Instantiate `Ajv` with `allErrors: true`, `validateSchema: true`, `strict: false`
    - `compile` the schema (without `$schema`) and run validation on `data`
    - On success: return `ok(undefined)`
    - On failure: return `err(AjvError)` with type `validation_error` including AJV `errors` when validation ran
    - On compile/throw: return `err(AjvError)` with type `compile_error` with message and empty errors array as appropriate
  - Returns: `Result<void, AjvError>`

- encrypt
  - Description: Validate cleartext, then replace string values at `x-encryptedFields` paths with encrypted **secret records** (via `securityService.encrypt`)
  - Parameters:
    - schema: object
    - data: unknown
  - Logic:
    - Run `validate(schema, data)`; on error, return that error
    - Deep-clone when `data` is a record; otherwise start from `{}`
    - For each path in `getEncryptedFields(schema)`:
      - Resolve parent and key; skip if missing
      - Skip `undefined` values; **only `typeof value === "string"`** is encrypted (non-strings are left as-is)
      - Call `securityService.encrypt(value)`; on failure return `AjvError` scoped to the field path
      - Assign ciphertext payload (typed as `SecretRecordModel`) into the parent object
  - Returns: `Promise<Result<Record<string, unknown>, AjvError>>` (success payload is the cloned object with encrypted fields)

- decrypt
  - Description: Replace stored secret records at `x-encryptedFields` paths with decrypted plaintext strings
  - Parameters:
    - schema: object
    - data: unknown
  - Logic:
    - Clone strategy same as encrypt
    - For each path:
      - Resolve parent and key; skip if missing
      - Skip `undefined`
      - `secretRecordModelSchema.safeParse(value)`; on parse failure return `AjvError` for that path
      - `securityService.decrypt(parsed.data)`; on failure return `AjvError` with cause
      - Write decrypted string back to `parent[key]`
  - Returns: `Promise<Result<Record<string, unknown>, AjvError>>`

- mask
  - Description: Remove keys at `x-encryptedFields` paths from a shallow/deep clone (omit secrets from responses without decrypting)
  - Parameters:
    - schema: object
    - data: unknown
  - Logic:
    - Clone when record; for each path, resolve parent/key and **`delete` the property** if present
  - Returns: `Promise<Result<Record<string, unknown>, never>>` (always succeeds with `ok`)

### Internal helpers (implementation detail)

The class may keep these as private methods or module-private functions, matching the former factory:

- `getEncryptedFields(schema)` — read `schema["x-encryptedFields"]`; must be `string[]` of paths or return `[]`
- `toPathParts`, `getParentAndKey` — dot-path navigation on nested records
- `encryptFieldsByPaths`, `decryptFieldsByPaths`, `maskFieldsByPaths` — shared loop over paths
