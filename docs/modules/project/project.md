# Project Module

## Controller
- Name: ProjectController
- Description: Controller for managing projects
- Dependencies:
  - ProjectService

### Methods
- find
  - Description: Find a project by id
  - Authentication
    - ApiKeyGuard: If the API key is associated with the project or not have an project associated, it will be able to access the project info, otherwise it will return an error.
  - Params:
    - id: string
  - Returns:
    - 200: ProjectEntity
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 404: NotFoundException
    - 500: InternalServerErrorException
- findMany
  - Description: Find many projects
  - Authentication
    - ApiKeyGuard: If the API key is not associated to a project, it will be able to access the projects list, otherwise it will return an error.
  - Query:
    - filterOptions: FilterOptions<ProjectEntity>
  - Returns:
    - 200: ProjectEntity[]
    - 401: UnauthorizedException
    - 403: ForbiddenException
    - 500: InternalServerErrorException
- create
  - Description: Create a new project
  - Authentication
    - ApiKeyGuard: If the API key is not associated to a project, it will be able to create a new project, otherwise it will return an error.
  - Body: CreateProjectDto
  - Returns:
    - 201: ProjectEntity
    - 400: BadRequestException
    - 401: UnauthorizedException
    - 403: ForbiddenException (if the API key is associated to a project)
    - 500: InternalServerErrorException
- update
  - Description: Update a project
  - Authentication
    - ApiKeyGuard: If the API key is associated with the project or not have an project associated, it will be able to access the project info, otherwise it will return an error.
  - Params:
    - id: string
  - Body: UpdateProjectDto
  - Returns:
    - 200: ProjectEntity
    - 400: BadRequestException
    - 401: UnauthorizedException
    - 403: ForbiddenException (if the API key is associated to other project)
    - 500: InternalServerErrorException
- delete
  - Description: Delete a project
  - Authentication
    - ApiKeyGuard: If the API key is associated with the project or not have an project associated, it will be able to access the project info, otherwise it will return an error.
  - Params:
    - id: string
  - Query:
    - force?: boolean
  - Returns:
    - 200: void
    - 400: BadRequestException
    - 401: UnauthorizedException
    - 403: ForbiddenException (if the API key is associated to other project)
    - 500: InternalServerErrorException

---

## Service

- Name: ProjectService
- Description: Service for managing projects

### Dependencies
- DatabaseService

### Methods
- find
  - Description: Find a project by id (returns the project)
  - Logic:
    - Find the project in the database
  - Parameters:
    - id: string
  - Returns: Promise<Result<ProjectEntity, DBError>>
- findMany
  - Description: Find many projects (returns the projects)
  - Logic:
    - Find the projects in the database
  - Parameters:
    - filterOptions: FilterOptions<ProjectEntity>
  - Returns: Promise<Result<ProjectEntity[], DBError>>
- create
  - Description: Create a new project (returns the created project)
  - Logic:
    - Create a new project in the database
  - Parameters:
    - input: CreateProjectDto
  - Returns: Promise<Result<ProjectEntity, DBError>>
- update
  - Description: Update a project (returns the updated project)
  - Logic:
    - Update the project in the database
  - Parameters:
    - id: string
    - input: UpdateProjectDto
  - Returns: Promise<Result<ProjectEntity, DBError>>
- delete
  - Description: Delete a project (returns void)
  - Logic:
    - Check if has any resource associated with the project
    - If has any resource associated with the project, and not force, return an error
    - If has any resource associated with the project, and force, delete the resources associated with the project
    - If no resources associated with the project, delete the project
  - Parameters:
    - id: string
    - force?: boolean
  - Returns: Promise<Result<void, DBError>>