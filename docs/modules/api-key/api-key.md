# API Key Module

## Controller

- Name: ApiKeyController
- Description: HTTP endpoints for managing API keys (credentials are never returned after creation except the one-time plain key on create response where applicable)
- Dependencies:
  - ApiKeyService

### Methods

- create
  - Description: Create a new API key bound to a project (plain key returned once in the response body; not listed again)
  - Authentication
    - ApiKeyGuard: Only the root API key can create API keys (non-root keys cannot call this endpoint)
  - Body: CreateApiKeyDto
  - Returns:
    - 201: ApiKeyEntity
    - 400: BadRequestException (e.g. invalid project, validation)
    - 401: UnauthorizedException
    - 403: ForbiddenException (caller is not root)
    - 500: InternalServerErrorException
- list
  - Description: List API keys stored in the database (never includes keyHash)
  - Authentication
    - ApiKeyGuard: Only the root API key can list API keys
  - Returns:
    - 200: ApiKeyEntity[] (safe projection; no keyHash)
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 500: InternalServerErrorException
- revoke
  - Description: Revoke an API key (sets revoked; does not remove the row)
  - Authentication
    - ApiKeyGuard: Root API key may revoke any key by id-or-keyHash. A non-root key may only revoke itself (authenticated key matches target)
  - Params:
    - id-or-keyHash: string
  - Returns:
    - 200: void
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 404: NotFoundException
    - 500: InternalServerErrorException
- delete
  - Description: Permanently delete an API key row
  - Authentication
    - ApiKeyGuard: Root API key may delete any key by id-or-keyHash. A non-root key may only delete itself (authenticated key matches target)
  - Params:
    - id-or-keyHash: string
  - Returns:
    - 200: void
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 404: NotFoundException
    - 500: InternalServerErrorException

---

## Service

- Name: ApiKeyService
- Description: Bootstrap root key, generation and lifecycle of API keys, and scheduled revocation of expired keys
- Implements: OnModuleInit

### Dependencies

- DatabaseService
- Logger

### Lifecycle

- onModuleInit
  - Description: Ensures a root API key exists when the application starts; optional forced regeneration via environment variable
  - Logic:
    - If there are no API keys in the database:
      - Create the root API key (no projectId; this is the only key allowed without a project)
      - Log the one-time plain key to the console (only on this first-ever bootstrap for that database)
    - If there is at least one API key and the environment variable REGENERATE_ROOT_KEY is set (truthy as defined by the implementation):
      - Delete the existing root API key (the one without projectId)
      - Generate and persist a new root API key
      - Log the new plain key to the console (this run only)
  - Notes:
    - REGENERATE_ROOT_KEY is intended for operational recovery; treat it as sensitive and avoid leaving it enabled permanently

### Methods

- generateKey
  - Description: Build a new random credential and the hash stored in the database
  - Logic:
    - Generate cryptographically secure random material
    - Compute SHA-256 for persistence (keyHash stored in DB; never returned from list)
    - Assemble the plaintext key as: `snipet_${process.env.NODE_ENV}_${opaqueSegment}` where opaqueSegment is derived from the random material or hash as specified by the implementation (must remain unguessable)
  - Returns: `{ plainKey: string; keyHash: string }` (plainKey shown only to callers that must persist or log it once)
- create
  - Description: Create an API key from input (non-bootstrap; always tied to a project)
  - Logic:
    - Enforce invariant: at most one API key may exist with null projectId (the root); this method always persists projectId, so it cannot create a second root
    - Call generateKey; store keyHash and metadata; return safe entity plus one-time plainKey
  - Parameters:
    - input: CreateApiKeyDto
  - Returns: Promise<\\Result<\\ApiKeyEntity, DBError>>
- update
  - Description: Update an API key name
  - Logic:
    - Same authorization rule as revoke (root: any id-or-keyHash; non-root: only self)
    - Update the name of the API key
  - Parameters:
    - id-or-keyHash: string
    - input: UpdateApiKeyDto
  - Returns: Promise<\\Result<\\Omit<\\ApiKeyEntity, "keyHash">[], DBError>>
- list
  - Description: Return all API key rows with a safe shape (exclude keyHash)
  - Logic:
    - Query API keys from the database
    - Map to DTO or projection without keyHash
  - Parameters: none (or optional filter reserved for future use)
  - Returns: Promise<\\Result<\\Omit<\\ApiKeyEntity, "keyHash">[], DBError>>
- revoke
  - Description: Mark a key as revoked without deleting the row
  - Logic:
    - Resolve caller: if root, allow revoke for any id-or-keyHash; if not root, allow only if id-or-keyHash matches the authenticated API key id-or-keyHash
    - Otherwise return forbidden / error result
    - Set revoked on the target row
  - Parameters:
    - id-or-keyHash: string
  - Returns: Promise<Result<void, DBError>>
- delete
  - Description: Remove an API key row from the database
  - Logic:
    - Same authorization rule as revoke (root: any id-or-keyHash; non-root: only self)
    - Delete the row
  - Parameters:
    - id-or-keyHash: string
  - Returns: Promise<Result<void, DBError>>
- revokeExpired
  - Description: Scheduled job to revoke keys past expiration
  - Scheduling: Cron runs every day at midnight (use a single timezone policy, e.g. UTC, and document it in code)
  - Logic:
    - Find API keys where expiresAt is in the past and the key is not already revoked (and not deleted)
    - Set revoked for each such row
  - Parameters: none
  - Returns: Promise<void>
