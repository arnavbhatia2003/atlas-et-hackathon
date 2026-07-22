# Layer 7 - OKF (the asset's knowledge document)

Every asset is written out as a single readable document that gathers everything
known about it, with each claim traced to its source. This is what a person reads in
the inspector and what search runs against.

```mermaid
flowchart LR
    AS(["Asset"]):::hero --> OKF["Knowledge document"]
    OKF --> H["Header<br/>name · type · aliases + where each came from"]
    OKF --> BODY["Body<br/>grouped by source, every line cited"]
    OKF --> LINK["Related assets<br/>hard links + labelled look-alikes"]
    OKF --> CITE["Citations<br/>source record ids"]

    classDef hero fill:#4f46e5,color:#fff,stroke:#4f46e5;
```

**What OKF stands for - Open Knowledge Format:** a simple convention (a markdown
file with a small structured header) that originated as a public specification for
sharing knowledge between tools. Here it is used only as a readable, portable *view*
built on demand from the database - not as a second place data is stored.

Why it helps: the same document serves three readers at once - a person in the UI, a
retrieval step that searches it, and an audit trail that shows where each fact came
from.

Next, how questions find the right evidence: [08 retrieval](08-retrieval-rag.md).
