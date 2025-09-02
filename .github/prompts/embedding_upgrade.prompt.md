---
mode: agent
---

## Objective
**Persist and backfill embeddings** for our IoT Dashboard, then keep them **in sync**. Create `public.event_embeddings` (FK → `public.iot_events.id`, 384‑D vectors), backfill the last **N** events using the official **AI Models** API, and set up a small scheduled job to process new events. **Double‑check official Supabase docs after every step**.

## Repo & Paths (must match EXACTLY)
- PROJECT_ROOT: `/home/ali/Documents/IOT-Dashboards`
- ENV_FILE: `/home/ali/Documents/IOT-Dashboards/.env`  # load, NEVER print
- REPORTS_DIR: `/home/ali/Documents/IOT-Dashboards/_reports`
- TABLES: `public.iot_events`, `public.event_embeddings`

## Use ALL MCPs
- `sequentialthinking` (plan), `filesystem` (read/write reports), `memory` (state),
- `brave-search` (open/verify official docs), `supabase` (SQL + checks)

## Official Docs (open via brave-search every step)
- **AI Models (Edge Functions)**: https://supabase.com/docs/guides/functions/ai-models
- **Vector / pgvector**: https://supabase.com/docs/guides/ai/vector
- **Database: Tables**: https://supabase.com/docs/guides/database/tables
- **Functions Overview**: https://supabase.com/docs/guides/functions
- **Serve functions**: https://supabase.com/docs/guides/functions/serve
- **Deploy functions**: https://supabase.com/docs/guides/functions/deploy
- **Schedule functions**: https://supabase.com/docs/guides/functions/schedule
- **Function secrets**: https://supabase.com/docs/guides/functions/secrets
- **CLI reference**: https://supabase.com/docs/reference/cli

> Follow our instruction manual discipline (deep-dive schema + review `_reports` before/after each step). :contentReference[oaicite:0]{index=0}

## Phase A — Plan & Pre‑flight
1) **Plan** (sequentialthinking): outline steps, risks, and rollback.
2) **Schema review**: confirm `iot_events(id)` exists & 384‑D embeddings needed.
3) **Docs check** (brave-search): open Vector guide + Tables guide; confirm `vector(384)`, IVFFLAT index, cosine distance syntax.

## Phase B — Create Table (persist)
1) **Enable extension** (verify in Vector docs first):
   ```sql
   create extension if not exists vector;
