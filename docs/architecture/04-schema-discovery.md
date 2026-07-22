# Layer 4 - Schema discovery

Before merging anything, the system has to know which columns are trustworthy
identity. It never hardcodes column names; instead each field earns a role from
three independent votes.

```mermaid
flowchart TB
    F["A field<br/>e.g. serial_no"] --> P["Pattern<br/>does the value match a<br/>known id shape?"]
    F --> C["Cardinality<br/>how unique are the values?"]
    F --> S["Meaning<br/>does the name look like an id?"]

    P --> V{{"Vote"}}:::hero
    C --> V
    S --> V
    V --> R["Role<br/>anchor · descriptive · internal-id"]:::good

    classDef hero fill:#4f46e5,color:#fff,stroke:#4f46e5;
    classDef good fill:#dcfce7,color:#166534,stroke:#16a34a;
```

## Why three votes
Any one signal is fooled easily - a sequential internal counter looks unique
(cardinality) but is worthless for identity. Requiring agreement across pattern,
uniqueness, and name catches those traps.

Not every id is equal. Each identity type carries a fixed, physics-based weight -
how strongly a match implies "same object":

`serial 0.95 · MAC 0.90 · UUID 0.85 · asset tag 0.60`

Those weights feed straight into the merge math next:
[05 resolution + confidence](05-resolution-confidence.md).
