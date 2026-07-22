# Brief for Manus - render the Atlas descriptive PDF

I've attached one document, `atlas-report.md`. It already contains the full content
and every diagram (as Mermaid code blocks). Turn it into a polished, well-typeset
PDF. There are no screenshots in this deliverable.

## Your role
You own 100% of the visual design - layout, colour, type, spacing. My job was the
content and the diagrams; your job is to make it a clean, readable, professional PDF.

## Output
- A single PDF. Standard page size, portrait.
- Render every Mermaid code block as a crisp vector diagram. Diagrams are the point -
  make them large and legible; give a diagram its own page (or the top of a page)
  rather than shrinking it to fit beside text.
- Keep the document's order and section structure exactly as written. It is
  deliberately layered: whole picture first, then one layer peeled at a time.

## Hard rules
1. Do not change any fact, name, id, score, or formula in the text.
2. Render the diagrams faithfully; do not redraw or restyle their internal structure.
3. You design the page - I am giving no colour or theme instruction.
4. Keep it a document, not a slideshow: flowing pages, not one-line slides. But keep
   the text as tight as it already is; do not pad it.
5. No AI-slop: no decorative stock imagery, no filler. Let the diagrams and worked
   examples do the work.

## Structure already in the file
- Layer 0 problem → Layer 1 system overview → Layers 2-13 peeling each component
  (ingestion, chain-of-custody, schema discovery, resolution + the confidence
  formula, knowledge graph, OKF, retrieval, ask copilot, root cause, compliance, data
  model, end-to-end).
- Then "the stack at a glance" (one reference table) and "the hard parts" (the design
  decisions).
- Callouts are tagged in the text: **Worked example**, **Why this way**, **New here**
  (a tool introduced at the layer that uses it). Treat these as visually distinct
  blocks (your styling), so a reader can skim them.

## What good looks like
A reader who has never seen Atlas can go top to bottom, understand the problem, see
the system, then follow each layer with a diagram and a concrete example - and come
away knowing both how it works and why each choice was made.

If helpful, add a short table of contents and page numbers. Nothing else needs
adding - the content is complete.
