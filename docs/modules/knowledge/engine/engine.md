# Knowledge Engine Module

CRUD for **knowledge engines**: processing configuration per project (`name`, `type`, `config`). Persisted fields match [Knowledge Engine (database)](../../../database/knowledge-engine.md).

`config` is **jsonb** and may hold secrets (URLs, API keys, model ids). The same pattern as sources applies: validate and encrypt with **AJV** using a JSON Schema selected by engine **`type`** (not by “provider” like sources).

---

## Controller

- Name: KnowledgeEngineController
- Description: HTTP API for managing knowledge engines within a project
- Dependencies:
  - KnowledgeEngineService

### Methods

- find
  - Description: Find a knowledge engine by id within a project
  - Authentication
    - ApiKeyGuard: Caller must be associated with `projectId` (or equivalent product rule); otherwise forbidden
  - Params:
    - projectId: string
    - id: string
  - Logic:
    - Call `KnowledgeEngineService.find` with `projectId`, `id`, and `includeEncryptedFields` false for the default HTTP response (masked config)
  - Returns:
    - 200: KnowledgeEngineEntity
    - 400: BadRequestException
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 404: NotFoundException
    - 500: InternalServerErrorException
- findMany
  - Description: List knowledge engines for a project
  - Authentication
    - ApiKeyGuard: Same project scope as `find`
  - Params:
    - projectId: string
  - Query:
    - filterOptions: FilterOptions<KnowledgeEngineEntity>
  - Returns:
    - 200: KnowledgeEngineEntity[]
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 500: InternalServerErrorException
- create
  - Description: Create a knowledge engine
  - Authentication
    - ApiKeyGuard: Caller must be allowed to create resources under `projectId`
  - Params:
    - projectId: string
  - Body: CreateKnowledgeEngineDto
  - Returns:
    - 201: KnowledgeEngineEntity
    - 400: BadRequestException
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 500: InternalServerErrorException
- update
  - Description: Update a knowledge engine
  - Authentication
    - ApiKeyGuard: Caller must be allowed to modify engines under `projectId`
  - Params:
    - projectId: string
    - id: string
  - Body: UpdateKnowledgeEngineDto
  - Returns:
    - 200: KnowledgeEngineEntity
    - 400: BadRequestException
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 404: NotFoundException
    - 500: InternalServerErrorException
- delete
  - Description: Delete a knowledge engine
  - Authentication
    - ApiKeyGuard: Same as update
  - Params:
    - projectId: string
    - id: string
  - Query:
    - force?: boolean — if the engine is still referenced (e.g. by pipelines or sources), require `force` to delete; otherwise 400 (define in implementation)
  - Returns:
    - 200: void
    - 400: BadRequestException
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 404: NotFoundException
    - 500: InternalServerErrorException

---

## Service

- Name: KnowledgeEngineService
- Description: CRUD for knowledge engines; `config` validated and encrypted per engine **type** schema (`x-encryptedFields` via [AjvModule](../../ajv/ajv.md))

### Dependencies

- AJVService (or `AjvSchemaService`)
- DatabaseService
- Logger
- Engine-type schema registry (JSON Schema per `type`, analogous to source providers)

### Methods

- find
  - Description: Load one engine by `id` scoped to `projectId`
  - Logic:
    - Load row from database
    - Resolve schema by `type`
    - If `includeEncryptedFields` is true: decrypt `config` with AJV/decrypt path
    - If false: mask encrypted paths in `config` for API-safe output
  - Parameters:
    - projectId: string
    - id: string
    - includeEncryptedFields: boolean
  - Returns: Promise<Result<KnowledgeEngineEntity, DBError>>

- findMany
  - Description: List engines for a project with optional filters
  - Logic:
    - Query by `projectId` and `filterOptions`
    - For each row, decrypt or mask `config` according to `includeEncryptedFields`
  - Parameters:
    - projectId: string
    - filterOptions: FilterOptions<KnowledgeEngineEntity>
    - includeEncryptedFields: boolean
  - Returns: Promise<Result<KnowledgeEngineEntity[], DBError>>

- create
  - Description: Create an engine row
  - Logic:
    - Resolve JSON Schema for `input.type`
    - `AJVService.encrypt(schema, input.config)` (validates cleartext, encrypts `x-encryptedFields`)
    - Insert with `projectId`, `name`, `type`, persisted `config`
    - Return entity; apply decrypt or mask on `config` per `includeEncryptedFields`
  - Parameters:
    - projectId: string
    - input: CreateKnowledgeEngineDto
    - includeEncryptedFields: boolean
  - Returns: Promise<Result<KnowledgeEngineEntity, DBError>>

- update
  - Description: Update an engine
  - Logic:
    - Load existing row; merge `config` per DTO rules
    - Resolve schema by resulting `type`
    - Validate + encrypt `config` with AJV; persist
    - Return with decrypt or mask per `includeEncryptedFields`
  - Parameters:
    - projectId: string
    - id: string
    - input: UpdateKnowledgeEngineDto
    - includeEncryptedFields: boolean
  - Returns: Promise<Result<KnowledgeEngineEntity, DBError>>

- delete
  - Description: Remove an engine
  - Logic:
    - If dependents exist and `force` is not set, return error; if `force`, cascade or detach per product rules
    - Delete the row when allowed
  - Parameters:
    - projectId: string
    - id: string
    - force?: boolean
  - Returns: Promise<Result<void, DBError>>

### DTOs

See [dto.md](./dto.md).
