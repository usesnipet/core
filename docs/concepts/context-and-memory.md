# Context

Context is the **runtime state** of a pipeline execution.

It exists only during execution and is used to share data between steps.

The context is automatically created when a pipeline starts and destroyed when it finishes.

---

## Scope

The scope of the context defines its lifecycle during execution.

* `pipeline`: The context is scoped to the pipeline and persists across all steps during a single execution.

> The context is **not persistent** and should not be used to store long-term data.

---

# Memory

Memory is responsible for **persistent data storage and retrieval** across executions.

It is independent from the pipeline and can be accessed at any time.

---

## Scope

The scope of the memory defines how data is organized and shared.

* `global`: Shared across all users and pipelines.
* `session`: Scoped to a specific session (e.g., a chat conversation).
* `user`: Scoped to a specific user.
* `custom`: A flexible scope defined by a custom key.

### Examples

```json
{ "type": "global" }
{ "type": "session", "id": "chat-123" /** chat session id from the runtime execution */ }
{ "type": "user", "id": "user-1" /** user id from the runtime execution */ }
{ "type": "custom", "key": "project-xyz" /** custom key from the runtime execution or hard coded in the pipeline definition */ }
```

---

## Memory Operations

Memory can be accessed both **inside pipelines** and **directly via API**.

### Available operations

* `read`: Retrieve stored data
* `write`: Store data
* `delete`: Remove data
* `query`: Search data (e.g., semantic search)
