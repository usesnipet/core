# Knowledge Engine

Defines **how data from a Knowledge Source is transformed into structured knowledge and how it is retrieved**.

A Knowledge Engine encapsulates both:

* **Ingestion** (data → knowledge)
* **Retrieval** (query → relevant context)

Each engine implements its own:

* processing pipeline
* storage strategy
* retrieval logic

---

## 🔄 Ingestion

The ingestion process is responsible for transforming raw data into a format that can be efficiently queried.

Each Knowledge Engine defines its own ingestion pipeline.

### Responsibilities:

* Parse raw data
* Transform and structure content
* Store data using an engine-specific strategy

> ⚠️ **Important:**
> A Knowledge Engine must explicitly define which **Knowledge Source types** it supports.

### Example (RAG Engine):

* Receive file from source (S3, filesystem, etc.)
* Parse content (PDF, HTML, Markdown, etc.)
* Split into chunks
* Generate embeddings
* Store in a vector database

---

## 🔍 Retrieval

The retrieval process is responsible for answering queries using the processed knowledge.

### Responsibilities:

* Interpret the query
* Retrieve relevant data
* Return structured results (not necessarily final LLM output)

> 💡 Retrieval ≠ generation
> The engine returns **context**, not the final answer.

### Example (RAG Engine):

* Receive user query
* Generate embedding
* Search vector database
* Rerank chunks (optional)
* Return context (NOT the final answer)
