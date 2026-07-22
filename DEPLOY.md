# Deploying Atlas (free stack)

Three pieces, all on free hosts, with **no cold start and every feature working**
(including Docling PDF ingestion):

| Piece | Free host | Notes |
|---|---|---|
| Frontend (static React) | **Vercel** | Zero-config Vite/SPA, always-on |
| Backend (FastAPI + Docling) | **Oracle Cloud Always Free VM** | 24 GB ARM VM, always-on, free forever |
| TLS for the backend | **Caddy + DuckDNS** | Free auto-HTTPS, no bought domain |
| Database | **Supabase** (free) | Postgres + pgvector |
| LLM / embeddings / rerank | **NVIDIA NIM** (free) | Already what the app uses |

> Why a VM and not Hugging Face / Render? HF now charges for Docker Spaces, and
> Render's free tier (512 MB) can't run Docling. Oracle's Always Free ARM VM has
> 24 GB RAM, stays on 24/7 (no cold start), and costs nothing — it only needs a
> card for identity verification at signup and is never charged.

---

## 1. Database — Supabase (free)

1. Create a project at [supabase.com](https://supabase.com) → note the DB password.
2. **SQL Editor** → paste the full contents of `backend/app/db/schema.sql`
   (it starts with `create extension if not exists vector;`) and **Run**.
3. **Project Settings → Database → Connection string → URI** (use the
   connection-pooler URI). That is your `DATABASE_URL`.

## 2. Backend — Oracle Cloud Always Free VM

### 2a. Create the VM
1. Sign up at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) (card
   for verification; Always Free resources are never charged).
2. **Compute → Instances → Create instance:**
   - **Shape:** change to **Ampere (Arm) — VM.Standard.A1.Flex**, e.g. 2 OCPU /
     12 GB (Always Free allows up to 4 OCPU / 24 GB).
   - **Image:** Ubuntu 22.04.
   - **SSH keys:** upload/download a key pair so you can SSH in.
   - Note the instance's **public IP**.

### 2b. Open the ports
Oracle blocks inbound traffic in two places — open both for TCP **80** and **443**:
1. **VCN Security List:** Networking → your VCN → Security Lists → default →
   **Add Ingress Rules**: source `0.0.0.0/0`, TCP, dest ports `80` and `443`.
2. **Ubuntu's own firewall** (SSH in first — see 2d), then:
   ```bash
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

### 2c. Free HTTPS domain (DuckDNS)
1. Go to [duckdns.org](https://www.duckdns.org), sign in, create a subdomain
   (e.g. `atlas-demo`) → you get `atlas-demo.duckdns.org`.
2. Set its IP to your VM's **public IP** (the "current ip" box → update).

### 2d. Install + run
SSH in (`ssh -i <key> ubuntu@<public-ip>`), then:
```bash
# Docker + compose
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER && newgrp docker

# Get the code
git clone https://github.com/arnavbhatia2003/atlas-et-hackathon.git
cd atlas-et-hackathon

# Backend secrets (from step 1 + your NVIDIA key)
cp backend/.env.example backend/.env
nano backend/.env         # set DATABASE_URL, NVIDIA_API_KEY, FRONTEND_ORIGIN

# Build + run (Caddy gets the TLS cert automatically for your DuckDNS domain)
DOMAIN=atlas-demo.duckdns.org docker compose -f deploy/docker-compose.yml up -d --build
```
First build takes ~10–15 min (torch + Docling models bake into the image).
Verify: open `https://atlas-demo.duckdns.org/api/health` → `healthy`.

In `backend/.env` set `FRONTEND_ORIGIN` to your Vercel URL (from step 3) and
`EMBEDDING_DIM=2048` (matches the schema). After editing, re-run the
`docker compose ... up -d` line to apply.

## 3. Frontend — Vercel (free)

1. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
2. **Root Directory: `frontend`** (Vite auto-detected; `vercel.json` handles the
   SPA rewrite).
3. **Environment Variables** → `VITE_API_URL = https://atlas-demo.duckdns.org`
4. Deploy → you get `https://<project>.vercel.app`.

## 4. Wire CORS
Set the VM's `backend/.env` → `FRONTEND_ORIGIN=https://<project>.vercel.app`,
then re-run the `docker compose ... up -d` line. (Extra origins:
`FRONTEND_ORIGINS`, comma-separated. localhost stays allowed for dev.)

## 5. Seed the demo
Add the five connectors in [`demo/connectors/`](demo/connectors/) from the
Connectors page (each as a `manual` connector, then Sync), and follow
[`demo/DEMO_SCRIPT.md`](demo/DEMO_SCRIPT.md).

---

## Notes
- **No cold start:** the VM runs 24/7 and `restart: always` brings the stack back
  after any reboot. The only latency you can't remove is the NVIDIA NIM endpoint's
  first-call warm-up (upstream); the app warms it on startup.
- **NVIDIA NIM** free tier is 40 requests/min **shared across all calls**. A
  public URL means anyone could consume the budget — fine for a judged demo.
- **Supabase free** pauses after ~7 days of inactivity; open the dashboard to
  resume.
- **Single worker** is required — the ingest job registry and DB pool assume one
  process. Don't add `--workers`.
- **ARM note:** the VM is ARM64; torch/Docling install from their aarch64 wheels.
  If a build ever fails on a package wheel, that's the place to look.
