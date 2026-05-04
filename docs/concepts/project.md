# Project

A project is the **top-level container** for all resources in the system.

It defines an isolated environment where resources such as knowledge bases, execution pipelines, and memory configurations are organized and managed.

Each project has a unique identifier and a name.

---

## Resource Scope

All resources belong to a project and are isolated from other projects.

This means:

* Pipelines can only access resources within the same project
* Knowledge bases are not shared across projects
* Memory is logically scoped per project

---

## Resources

A project can contain:

### Knowledge Bases And Sources

Structured or unstructured data sources used to create knowledge bases.

Examples:

* Documents (PDF, markdown, etc.)
* Databases (PostgreSQL, MySQL, etc.)
* APIs (OpenAI, Gemini, etc.)
* YouTube (YouTube videos)
* GitHub (GitHub repositories)
* S3 (Amazon S3)
* Cloud Storage (Azure Blob Storage, Google Cloud Storage, etc.)
* Local File System (local files)

---

### Execution Pipelines

Reusable workflows that define how data is processed.

Pipelines orchestrate steps such as:

* memory access
* knowledge retrieval
* LLM generation
* transformations

---

### Memory

Defines how persistent data is stored and accessed.

Unlike other resources, memory is **not just static data**, but a **configurable system** that supports different storage and retrieval strategies.

A project can define multiple memory configurations.

Each memory can have:

* a storage engine (e.g., KV, vector, graph)
* a retrieval strategy
* scope rules (global, session, user, custom)

---

## Example

```json
{
  "project": "My Project",
  "knowledges": [
    "docs",
    "tickets",
    "faq"
  ],
  "pipelines": [
    "chat",
    "support-agent",
    "analytics"
  ],
  "memories": [
    "chat-history",
    "user-profile"
  ]
}
```

---

## Isolation Model

Projects are fully isolated environments.

* No cross-project access by default
* Resources must be explicitly duplicated or migrated
* Ensures multi-tenant safety (important for cloud version)

---

## Key Concepts

* A project is the **boundary of isolation**
* All resources are scoped to a project
* Pipelines orchestrate resources within the project
* Memory is a **system**, not just stored data