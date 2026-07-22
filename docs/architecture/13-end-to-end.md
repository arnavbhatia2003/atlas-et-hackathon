# Layer 13 - End-to-end

Two flows connect every layer above: getting data in, and getting an answer out.
Both stream their progress to the user.

## Getting data in

```mermaid
sequenceDiagram
    autonumber
    participant UI as Web app
    participant API as Backend
    participant DB as Database
    participant AI as Models

    UI->>API: sync a source
    API->>DB: store only new records
    API->>API: discover schema · resolve · build graph
    API->>AI: embed new text
    API->>DB: write assets, edges, knowledge docs
    API-->>UI: live status per step, then done
```

## Getting an answer out

```mermaid
sequenceDiagram
    autonumber
    participant UI as Web app
    participant API as Backend
    participant DB as Database
    participant AI as Models

    UI->>API: ask a question
    API->>API: route by intent
    API->>DB: search records + knowledge docs
    API->>AI: re-score, then reason over evidence
    AI-->>UI: reasoning trace, then answer
    API-->>UI: answer + citations + confidence
```

**How the live updates travel - Server-Sent Events (SSE):** a plain one-way stream
over ordinary HTTP where the server pushes messages as they happen. It is used so
each step's status and each token of the answer appear immediately, with no polling
and no two-way socket to manage.

Perceived speed comes from streaming: the user sees the first words almost at once
rather than waiting for the whole answer.
