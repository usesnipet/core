# Knowledge Source
- id
- projectId
- name
- engines (a source can be used by multiple engines)
- provider (S3, GCS, LOCAL, API, DATABASE, etc.) - can be a plugin
- dataType (FILE, MEDIA, API, DATABASE, etc.)
- config (jsonb) - ex: connection string, api key, url, etc.
- createdAt
- updatedAt

# Knowledge Source Item
- id
- externalId
- hash (sha256) - hash to identify the content of the item (used to detect changes)
- name (optional)
- knowledgeSourceId
- metadata (jsonb) - ex: name, size, type, etc.
- createdAt
- updatedAt
- deletedAt
  - unique constraint on (externalId, knowledgeSourceId)
  - index on (hash)