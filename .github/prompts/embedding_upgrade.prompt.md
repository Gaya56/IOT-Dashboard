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

> Follow our instruction manual discipline (deep-dive schema + review `_reports` before/after each step).

## Phase A — Plan & Pre‑flight
1) **Plan** (sequentialthinking): outline steps, risks, and rollback.
2) **Schema review**: confirm `iot_events(id)` exists & 384‑D embeddings needed.
3) **Docs check** (brave-search): open Vector guide + Tables guide; confirm `vector(384)`, IVFFLAT index, cosine distance syntax.

## Phase B — Create Table (persist)
1) **Enable extension** (verify in Vector docs first):
   ```sql
   create extension if not exists vector;
   ```

2) **Create table**:
   ```sql
   create table if not exists public.event_embeddings (
     event_id bigint primary key
       references public.iot_events(id) on delete cascade,
     embedding vector(384) not null,
     created_at timestamptz default now()
   );
   alter table public.event_embeddings enable row level security;
   ```

3) **Index (cosine)**:
   ```sql
   create index if not exists event_embeddings_embedding_idx
     on public.event_embeddings using ivfflat (embedding vector_cosine_ops)
     with (lists = 100);
   analyze public.event_embeddings;
   ```

4) **Artifacts**: save `_reports/emb_table_create.sql` and a short `_reports/emb_table_create.md`.

## Phase C — Backfill Last N

1) **Docs check**: open AI Models guide; confirm gte-small usage and function patterns.

2) **Implement backfill function** (Edge Function `embed-backfill`):
   - **Logic**: select last N events missing embeddings → for each, call `new Supabase.ai.Session('gte-small')` → `run(input, { mean_pool:true, normalize:true })` → upsert into event_embeddings.
   - **Use service secrets** (never print).

3) **Serve locally**:
   ```bash
   supabase functions serve --env-file supabase/functions/.env
   ```

4) **Run backfill** (HTTP call per docs) with a small N (e.g., 50). Log duration + rows inserted.

5) **Artifacts**: `_reports/emb_backfill.json` (counts, sample IDs), `_reports/emb_backfill.md`.

## Phase D — Keep In Sync (Scheduled)

1) **Docs check**: open "Schedule functions".

2) **Create scheduled job** to invoke a tiny `embed-sync` function (or reuse `embed-backfill` with N=25) every minute:
   - **CLI** (per docs): create schedule with cron, pointing to your function endpoint.

3) **Test**: insert one new `iot_events` row → wait for schedule → verify a matching row appears in `event_embeddings`.

4) **Artifacts**: `_reports/emb_sync_schedule.md` (cron, function path), `_reports/emb_sync_test.json`.

## Validation & Tests (must pass)

### Row parity:
```sql
select
  (select count(*) from public.iot_events) as events,
  (select count(*) from public.event_embeddings) as embedded,
  (select count(*) from public.iot_events e
     left join public.event_embeddings ee on ee.event_id = e.id
   where ee.event_id is null) as missing;
```
Expect missing = 0 (after backfill + sync).

### Similarity smoke (cosine distance, top‑K):
```sql
-- Example: compare last embedded event embedding to others
with q as (
  select embedding from public.event_embeddings
  order by created_at desc limit 1
)
select e.id, 1 - (ee.embedding <=> q.embedding) as cosine_similarity
from public.event_embeddings ee
join public.iot_events e on e.id = ee.event_id, q
order by cosine_similarity desc
limit 5;
```
Confirm results return quickly and look sensible.

**Reports**: write `_reports/emb_validation.json` (counts, timings) + `_reports/emb_validation.md`.

## Success Criteria

- `event_embeddings` exists (384‑D), FK to iot_events, IVFFLAT index built.
- Backfill inserts embeddings for last N events; scheduler fills future events.
- Validation shows missing = 0; similarity query returns sensible neighbors.
- Every step verified against official docs and saved to `_reports/`.
- No secrets printed; RLS intact; repo behavior unchanged.