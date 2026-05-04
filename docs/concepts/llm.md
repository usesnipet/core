# LLM Provider

A LLM provider is a service that provides an LLM API. This is the service that will be used to generate the text.

## Example of LLM Providers
- OpenAI
- Anthropic
- Google
- Microsoft
- AWS
- Azure
- IBM
- Oracle
- Snowflake


# LLM Calls

A LLM call is a call to an LLM provider. It is a registered call to an LLM provider. Used for tracking the calls to the LLM provider and the costs.

## Example
- LLM Provider: OpenAI
- LLM Call:
  - Cost: $0.001
  - Duration: 100ms
  - Model: gpt-4o
  - Input Tokens: 100
  - Output Tokens: 100
  - Total Tokens: 200
  - Usage: 200 tokens (100 input tokens + 100 output tokens)
  - Created At: 2026-01-01 12:00:00

- LLM Provider: Gemini
- LLM Call:
  - Cost: $0.001
  - Duration: 100ms
  - Model: text-embedding-3-small
  - Created At: 2026-01-01 12:00:00