# Layer 10 - Root-cause analysis

Four stages. Evidence is gathered from the graph first; the model reasons only when
real failure evidence exists, so it can never invent a cause for a healthy asset.

```mermaid
flowchart LR
    A["Resolve<br/>the asset"] --> B["Gather evidence<br/>failures · upstream faults"]
    B --> G{{"any failure<br/>evidence?"}}:::hero
    G -->|no| SKIP["Say so plainly<br/>no guess"]:::warn
    G -->|yes| R["Reason<br/>one model call"]
    R --> OUT["Hypotheses<br/>each with evidence + confidence"]:::good
    SKIP --> OUT

    classDef hero fill:#4f46e5,color:#fff,stroke:#4f46e5;
    classDef good fill:#dcfce7,color:#166534,stroke:#16a34a;
    classDef warn fill:#fef9c3,color:#854d0e,stroke:#eab308;
```

## Why the gate
No failures on record means there is nothing to diagnose. The gate stops the model
from producing a confident-sounding story with no basis.

**Multi-hop:** assets can declare what they depend on, so a symptom on one asset can
be traced to a fault on the thing upstream of it - for example a downstream outage
attributed to a flapping upstream network port. The reasoning cites that upstream
record.

Every hypothesis names the evidence it rests on; contradictions and open questions
are listed rather than smoothed over.

Sibling workflow: [11 compliance](11-compliance.md).
