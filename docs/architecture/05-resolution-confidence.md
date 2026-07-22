# Layer 5 - Resolution + confidence

Two records are compared on shared evidence, scored, and either merged, queued for
a human, or kept apart. This is the step that collapses the four disconnected
records from Layer 0 into one asset.

```mermaid
flowchart LR
    A["Record A"] --> E["Shared evidence<br/>matching ids · text similarity"]
    B["Record B"] --> E
    E --> SC{{"confidence"}}:::hero

    SC --> D1["≥ 0.95 · merge"]:::good
    SC --> D2["0.80–0.95 · suggest"]:::warn
    SC --> D3["0.60–0.80 · review"]:::warn
    SC --> D4["< 0.60 · keep apart"]:::bad
    E -->|"different ids on same field"| BR["bridge conflict<br/>a human decides"]:::bad

    classDef hero fill:#4f46e5,color:#fff,stroke:#4f46e5;
    classDef good fill:#dcfce7,color:#166534,stroke:#16a34a;
    classDef warn fill:#fef9c3,color:#854d0e,stroke:#eab308;
    classDef bad fill:#fee2e2,color:#991b1b,stroke:#ef4444;
```

## The confidence formula (exact, from code)

```
confidence = base × redundancy × conflict_penalty        (capped at 1.0)
```

- **base** - the strongest single piece of evidence
  (serial 0.95, MAC 0.90, UUID 0.85; or the text-similarity score itself).
- **redundancy** - reward for independent agreement:
  `1 signal → 1.00 · 2 → 1.05 · 3+ → 1.08`, plus `+0.03` when an exact id match
  and text similarity both agree.
- **conflict_penalty** - punish contradictions:
  `none → 1.00 · medium id clash → 0.80 · strong id clash → 0.40`.

## Why it behaves well
Merges run strongest-evidence-first. A merge that would put two different strong
ids (say two serials) in one asset is blocked and raised for review, not quietly
forced. Human decisions always override the score.

**Method used - union-find, strongest-edge-first:** a standard way to grow groups
by joining the most confident links first, so weak or conflicting links never drag
unrelated records together.

Next, where merged assets are placed: [06 knowledge graph](06-knowledge-graph.md).
