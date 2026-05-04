# Execution Pipeline

The execution pipeline is a sequence of steps that process data using the context.
Each step can read from and write to the context.

---

## Example

```json
{
  "steps": [
    {
      "use": "memory",
      "action": "read",
      "from": "chat-history-identifier",
      "scope": { "type": "session" }
    },
    {
      "use": "knowledge",
      "from": "knowledge-identifier",
      "options": {
        "topK": 5
      }
    },
    {
      "use": "llm",
      "model": ["provider:model", "provider:fallback"],
      "stream": true,
      "output": {
        "format": "json",
        "schema": {
          "type": "object",
          "properties": {
            "answer": { "type": "string" }
          }
        }
      },
      "prompt": "History: {{ctx.memory}}\n\nKnowledge: {{ctx.knowledge}}\n\nQuestion: {{ctx.input}}"
    },
    {
      "use": "memory",
      "action": "write",
      "from": "chat-history",
      "scope": { "type": "session" }
    }
  ]
}
```

---

# Step Types

## Memory

Handles persistent data.

* `from`: Identifier of the memory (plugin name)
* `scope`: Defines where the data is stored/retrieved (global, session, user, custom)
* `action`: Operation (`read`, `write`, `delete`, `query`)
* `options`: Additional configuration (e.g., limits, filters, search params)

---

## Knowledge

Retrieves data from a knowledge base.

* `from`: Knowledge identifier (optional, if not provided, should pass on call the execution pipeline)
* `engine`: Identifier of the knowledge engine (optional, if not provided, should pass on call the execution pipeline)
* `options`: Retrieval configuration (topK, filters, search type, etc.)

---

## LLM

Generates output using a language model.

* `model`: Array of models (first is primary, others are fallback)
* `stream`: Enables streaming output
* `output`: Defines output format (text, json, schema)
* `prompt`: Template using context variables

---

# Key Concepts

* Context is **temporary** and exists only during execution
* Memory is **persistent** and accessible anytime
* Pipelines orchestrate steps but do not own data
* Memory can be used both inside and outside pipelines
