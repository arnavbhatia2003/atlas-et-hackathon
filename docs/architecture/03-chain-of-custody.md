# Layer 3 - Chain-of-custody (documents)

An uploaded document can never be silently lost. One save is the dividing line:
fail before it and nothing is written; fail after it and the parse is kept and
marked recoverable.

```mermaid
flowchart TB
    U["Upload document"] --> P["Parse"]
    P -->|fails| X1["Nothing saved<br/>clean retry"]:::bad
    P -->|ok| SAVE["DURABLE SAVE<br/>the boundary"]:::hero
    SAVE --> POST["Extract + store"]
    POST -->|fails| X2["Parse kept<br/>marked recoverable"]:::warn
    POST -->|ok| DONE["Linked to its asset"]:::good

    classDef hero fill:#4f46e5,color:#fff,stroke:#4f46e5;
    classDef good fill:#dcfce7,color:#166534,stroke:#16a34a;
    classDef warn fill:#fef9c3,color:#854d0e,stroke:#eab308;
    classDef bad fill:#fee2e2,color:#991b1b,stroke:#ef4444;
```

Both failure paths are covered by explicit tests, so the two cases are provably
distinct rather than merely claimed.

**Tool used here - Docling:** an open-source document parser from IBM Research (now
under the Linux Foundation's LF AI & Data), built to get documents "ready for gen
AI". It reads a PDF's real structure - reading order, headings, tables - before any
model sees it, so structure is extracted, not guessed. OCR is available for scanned
pages but kept off here (digital PDFs). Layout parsing is memory-heavy, so it runs a
page at a time with images off; oversized or image-only PDFs fall back to a
lightweight text-only extractor.

Next: how fields are understood - [04 schema discovery](04-schema-discovery.md).
