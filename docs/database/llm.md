# LLM Provider
- id
- projectId
- name
- providerId (openai, gemini, voyage)
- description
- config (jsonb) - ex: api key, base url, etc.
- models (jsonb) - { chat?: [string]; embedding?: [{model: string; dimension: number; opts: any}]; rerank?: [string]; }
- createdAt
- updatedAt

# LLM Call
- id
- projectId
- model
- cost (optional)
- promptTokens
- completionTokens (optional)
- totalTokens (optional)
- duration
- providerId (foreign key to LLM Provider)
- createdAt