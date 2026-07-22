# Deploying Atlas (free stack)

A working public deployment has three pieces. This guide uses only **free**
hosts. Honest caveat up front: on free tiers you cannot fully eliminate cold
starts — the frontend is always-on (static), but the backend sleeps when idle,
Supabase pauses after ~7 days idle, and the NVIDIA endpoint scales to zero. A
free keep-warm ping (step 5) keeps things hot for a demo.

| Piece | Free host | Why |
|---|---|---|
| Frontend (static React) | **Vercel** | Zero-config Vite/SPA, no cold start |
| Backend (FastAPI + Docling) | **Hugging Face Spaces** (Docker) | 16 GB RAM free — the only free host big enough for Docling/torch |
| Database | **Supabase** (free) | Postgres + pgvector |
| LLM / embeddings / rerank | **NVIDIA NIM** (free) | Already what the app uses |

---

## 1. Database — Supabase (free)

1. Create a project at [supabase.com](https://supabase.com) → note the DB
   password.
2. **SQL Editor** → run `create extension if not exists vector;`
3. Paste and run `backend/app/db/schema.sql`.
4. **Project Settings → Database → Connection string → URI** (use the
   connection-pooler URI). That is your `DATABASE_URL`.

## 2. Backend — Hugging Face Spaces (Docker, free)

1. Create a new **Space** at [huggingface.co](https://huggingface.co/new-space)
   → **SDK: Docker**, hardware **CPU basic (free, 16 GB)**.
2. In the Space's `README.md` (web editor), keep the metadata block and set the
   port:
   ```yaml
   ---
   title: Atlas API
   sdk: docker
   app_port: 7860
   ---
   ```
3. Upload the backend into the Space (web UI "Add file" / drag-drop, or git):
   - the repo's **`Dockerfile`** (at the Space root), and
   - the whole **`backend/`** folder.
   (The Dockerfile copies `backend/` and pre-downloads the Docling models so the
   first PDF ingest isn't a cold download. First build takes ~10–15 min.)
4. **Settings → Variables and secrets** → add (as **secrets**):
   - `NVIDIA_API_KEY`
   - `DATABASE_URL` (from step 1)
   - `FRONTEND_ORIGIN` (fill in after step 3 — your Vercel URL)
   - optional: `LANGCHAIN_API_KEY`, `LANGCHAIN_TRACING_V2=true`
5. The backend URL will be `https://<user>-<space-name>.hf.space`. Verify
   `…/api/health` returns `healthy`.

## 3. Frontend — Vercel (free)

1. [vercel.com](https://vercel.com) → **Add New → Project** → import the GitHub
   repo.
2. **Root Directory: `frontend`** (Vercel auto-detects Vite; `vercel.json`
   already sets the SPA rewrite).
3. **Environment Variables** → `VITE_API_URL = https://<user>-<space>.hf.space`
4. Deploy → you get `https://<project>.vercel.app`.

## 4. Wire CORS

Set the backend's `FRONTEND_ORIGIN` (HF Space secret) to your exact Vercel URL
(e.g. `https://atlas.vercel.app`), then restart the Space. The backend already
reads this via env; localhost stays allowed for dev. (Extra origins:
`FRONTEND_ORIGINS`, comma-separated.)

## 5. Keep it warm (avoid the idle cold start)

Create a free monitor at [cron-job.org](https://cron-job.org) or
[UptimeRobot](https://uptimerobot.com) that GETs
`https://<user>-<space>.hf.space/api/health` every ~10 minutes. This keeps the
Space from sleeping so your demo is instant.

## 6. Seed the demo

Add the five connectors in [`demo/connectors/`](demo/connectors/) from the
Connectors page (each as a `manual` connector, then Sync), and follow
[`demo/DEMO_SCRIPT.md`](demo/DEMO_SCRIPT.md).

---

## Known free-tier limits (be honest in the demo)
- **Backend cold start**: after long idle the Space sleeps (~30–60 s to wake).
  The keep-warm ping in step 5 prevents this during a session.
- **NVIDIA NIM**: free tier is 40 requests/min **shared across all calls**, and
  the hosted endpoint scales to zero (the app warms it on startup). A public URL
  means anyone could consume the budget — fine for a judged demo, not for real
  traffic.
- **Supabase free** pauses after ~7 days of inactivity; open the dashboard to
  resume.
- **PDF ingestion** works on HF Spaces (16 GB). On a 512 MB free host it would
  crash on Docling — that's why we don't use Render/Fly free for the backend.

## Alternative: Render (backend)
Render deploys this `Dockerfile` from GitHub via a Blueprint, but its **free**
web service is 512 MB and sleeps — everything works there **except PDF
ingestion** (Docling needs more RAM). Use a paid Render plan (≥2 GB) if you want
Render + PDFs. HF Spaces avoids the cost.
