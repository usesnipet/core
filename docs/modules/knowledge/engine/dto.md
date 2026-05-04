# Knowledge Engine Module DTOs

Fields align with [Knowledge Engine (database)](../../../database/knowledge-engine.md): `name`, `type`, `config` (plus `projectId` on routes, not in body).

## CreateKnowledgeEngineDto

- name: string
- type: string — engine implementation id (schema selector for `config`)
- config: Record<string, unknown>

## UpdateKnowledgeEngineDto

- name?: string
- type?: string
- config?: Record<string, unknown>
