---
mode: agent
---

## Objective
Set up and test a minimal **Supabase Edge Function** that uses the built‑in **AI Models** API for embeddings (per official docs). Keep it simple, match our repo and tables, and document results.

## MUST Follow (every step)
- **Official docs ONLY**: https://supabase.com/docs/guides/functions/ai-models (use `brave-search` to open/verify this page and any linked official pages).
- **Always first**:
  1) Deep‑dive Supabase architecture (tables/relationships/triggers/RLS).
  2) Review `/home/ali/Documents/IOT-Dashboards/_reports`.
- **Use ALL MCPs**: `sequentialthinking`, `brave-search`, `filesystem`, `memory`, `supabase`.
- **After step**: insert 1 test row into `iot_events`, smoke the app, save short summary+JSON to `_reports/`.

## Inputs/Paths
- PROJECT_ROOT: `/home/ali/Documents/IOT-Dashboards`
- ENV_FILE: `/home/ali/Documents/IOT-Dashboards/.env` (load, **never print**)
- REPORTS_DIR: `/home/ali/Documents/IOT-Dashboards/_reports`
- FUNCTION_NAME: `embedder`

## Steps
1) **Plan** (sequentialthinking): note risks, confirm no schema changes needed.
2) **Verify docs** (brave-search): open the AI Models guide and confirm the sample for embeddings (`gte-small`).
3) **Scaffold** (CLI): `supabase functions new embedder`
4) **Implement**: in `functions/embedder/index.ts`, create:
   ```ts
   import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
   const session = new Supabase.ai.Session('gte-small')
   Deno.serve(async (req) => {
     const q = new URL(req.url).searchParams
     const input = q.get('input') ?? 'hello world'
     const out = await session.run(input, { mean_pool: true, normalize: true })
     return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } })
   })
````

5. **Serve locally**: `supabase functions serve --env-file supabase/functions/.env`
6. **Test**: call the function (per docs curl style). Expect **HTTP 200** and a JSON embedding array (>0 length). Call with a different input; vectors should differ.
7. **Post‑step checks** (supabase MCP): insert 1 small row into `iot_events`, read back; app smoke test.
8. **Artifacts** (filesystem/memory): write `_reports/ai_models_setup.md` and `_reports/ai_models_test.json` (inputs used, outputs redacted, doc links referenced).

## Success Criteria

* Function returns embeddings locally (200 + numeric vector).
* Repo unchanged functionally; no secrets printed.
* Test insert into `iot_events` and smoke test pass.
* Reports saved with explicit links to the official docs.

```
```
