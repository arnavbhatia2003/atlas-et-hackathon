# Layer 0 - The problem

One real machine shows up in many systems. They agree on a serial number but each
carries different extra fields, and nothing joins them. So no one record can answer
"what is this asset, and what has happened to it?"

```mermaid
flowchart TB
    R(["One physical pump"]):::hero

    R --> M["IBM Maximo<br/>serial SN-4471<br/>work order WO-1001"]
    R --> S["SAP EAM<br/>serial SN-4471<br/>location Unit-3"]
    R --> P["SharePoint<br/>serial SN-4471<br/>inspection report"]
    R --> F["Sensor feed<br/>tag P-101<br/>vibration reading"]

    M --> G["Same asset · 4 systems · no shared key<br/>= 4 disconnected records"]:::bad
    S --> G
    P --> G
    F --> G

    classDef hero fill:#4f46e5,color:#fff,stroke:#4f46e5;
    classDef bad fill:#fee2e2,color:#991b1b,stroke:#ef4444;
```

Peel inward from here: [01 system overview](01-system-overview.md).
