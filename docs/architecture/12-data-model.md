# Layer 12 - Data model (core tables)

The shape underneath everything, trimmed to the tables that carry the story. All of
it is one PostgreSQL database.

```mermaid
erDiagram
    source_records {
        text system
        jsonb raw_json
        vector embedding
    }
    unified_assets {
        text unified_id PK
        text asset_name
        bool needs_review
    }
    asset_identifiers {
        text unified_id FK
        text concept
        text value
    }
    edges {
        text source_id
        text relation_type
        text target_id
        text layer
    }
    okf_documents {
        text unified_id PK
        text markdown
        vector embedding
    }
    review_queue {
        text kind
        text status
    }

    unified_assets ||--o{ asset_identifiers : "known by"
    unified_assets ||--o{ source_records : "backed by"
    unified_assets ||--o| okf_documents : "written up as"
    unified_assets ||--o{ edges : "linked through"
    unified_assets ||--o{ review_queue : "may need"
```

## Reading it
- `source_records` is durable ground truth - raw input, never overwritten. Its
  `embedding` powers meaning-search.
- `unified_assets` + `asset_identifiers` are the resolved result: one asset, many
  ids from many systems.
- `edges` is the whole knowledge graph, split by `layer` into physical vs
  operational.
- `okf_documents` is the built knowledge view per asset, searchable on its own.
- `review_queue` is the human-in-the-loop backlog.

**Extension used - `pgvector`:** adds a vector column type and similarity search to
PostgreSQL, so embeddings live beside the records instead of in a separate service.

Finally, the two flows tied together: [13 end-to-end](13-end-to-end.md).
