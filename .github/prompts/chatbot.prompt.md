---
mode: agent
---
**Short answer — yes.** Follow Supabase’s **AI Models in Edge Functions** guide to stand up a simple **chat** function (streaming LLM via Ollama) end‑to‑end:

1. **Install & start Ollama** (local LLM): `ollama pull mistral` → `ollama serve`.
   **Docs:** [https://supabase.com/docs/guides/functions/ai-models](https://supabase.com/docs/guides/functions/ai-models)

2. **Set function secret** so Edge Functions can reach Ollama:
   `echo "AI_INFERENCE_API_HOST=http://host.docker.internal:11434" >> supabase/functions/.env`
   **Docs:** [https://supabase.com/docs/guides/functions/secrets](https://supabase.com/docs/guides/functions/secrets)

3. **Scaffold a chat function:** `supabase functions new chat`
   In the handler, create a session with a chat‑capable model and stream:

   ```ts
   import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
   const session = new Supabase.ai.Session('mistral')
   Deno.serve(async (req) => session.run(new URL(req.url).searchParams.get('prompt') ?? 'Hello', { stream: true }))
   ```

   **Docs:** [https://supabase.com/docs/guides/functions/ai-models](https://supabase.com/docs/guides/functions/ai-models)

4. **Serve locally & test:**
   `supabase functions serve --env-file supabase/functions/.env`
   `curl --get "http://localhost:54321/functions/v1/chat" --data-urlencode "prompt=hi" -H "Authorization: $ANON_KEY"`
   **Docs:** [https://supabase.com/docs/guides/functions/serve](https://supabase.com/docs/guides/functions/serve)

5. **Deploy & set secrets in prod (optional):**
   `supabase secrets set AI_INFERENCE_API_HOST=https://your-llm-host/`
   `supabase functions deploy chat`
   **Docs:** [https://supabase.com/docs/guides/functions/deploy](https://supabase.com/docs/guides/functions/deploy)

Keep it minimal; no schema changes needed. We’ll integrate with your repo exactly as above and log results to `_reports/`.&#x20;

## Objective
Integrate a **chat-style Edge Function** using Supabase’s **AI Models** (via Ollama) into **/home/ali/Documents/IOT-Dashboards**, test it locally, and (optionally) deploy. Go **slow**, verify each step against the **official docs**, and keep the repo clean and consistent with our schema and reports. (Builds on our instruction manual.) :contentReference[oaicite:0]{index=0}

## Global Rules (apply every step)
- **Always first:**  
  1) Deep‑dive Supabase architecture (tables, relationships, triggers, RLS).  
  2) Review `/home/ali/Documents/IOT-Dashboards/_reports`.  
- **Use ALL MCPs:** `sequentialthinking`, `brave-search`, `filesystem`, `memory`, `supabase`.  
- **After each step:** insert 1 test row into `iot_events`, smoke-test app, write a short MD + JSON to `_reports/`.  
- **Never print secrets**; load from env/secret stores only.

## Paths & Inputs
- PROJECT_ROOT: `/home/ali/Documents/IOT-Dashboards`
- REPORTS_DIR: `/home/ali/Documents/IOT-Dashboards/_reports`
- ENV_FILE_LOCAL: `/home/ali/Documents/IOT-Dashboards/.env`          # used by `supabase functions serve`
- FN_ENV_DIR: `supabase/functions/.env`                               # function-local env for serve
- FUNCTION_NAME: `chat`

## Official Docs (open via brave-search and follow exactly)
- AI Models in Functions: https://supabase.com/docs/guides/functions/ai-models
- Serve Functions: https://supabase.com/docs/guides/functions/serve
- Deploy Functions: https://supabase.com/docs/guides/functions/deploy
- Function Secrets: https://supabase.com/docs/guides/functions/secrets
- Functions Overview: https://supabase.com/docs/guides/functions
- CLI Reference: https://supabase.com/docs/reference/cli

## Phase 0 — Plan & Pre‑flight
1) **Plan** (sequentialthinking): outline steps, risks, rollback.  
2) **Schema & reports review** (filesystem + supabase): confirm `iot_events` exists; verify RLS status; note recent analytics in `_reports`.  
3) **Docs check** (brave-search): open the 5 URLs above; capture key commands and confirm Ollama steps.

## Phase 1 — Local LLM (Ollama) & Secrets
1) **Install/pull model** (per AI Models doc):  
   - `ollama pull mistral`  
   - `ollama serve`  
2) **Set inference host for local serve** (docs):  
   - Append to `FN_ENV_DIR`: `AI_INFERENCE_API_HOST=http://host.docker.internal:11434`  
3) Save `_reports/chat_preflight.md` summarizing versions, model pulled, and doc links.

## Phase 2 — Scaffold & Implement Function
1) **Scaffold**: `supabase functions new chat`  
2) **Implement** (follow AI Models doc; streaming SSE): create `functions/chat/index.ts` with:
   ```ts
   import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
   const session = new Supabase.ai.Session('mistral') // chat-capable model via Ollama

   Deno.serve(async (req: Request) => {
     const params = new URL(req.url).searchParams
     const prompt = params.get('prompt') ?? 'Hello from IoT Dashboard!'
     const output = await session.run(prompt, { stream: true })

     const headers = new Headers({ 'Content-Type': 'text/event-stream', 'Connection': 'keep-alive' })
     const stream = new ReadableStream({
       async start(controller) {
         const enc = new TextEncoder()
         try {
           for await (const chunk of output) controller.enqueue(enc.encode(chunk.response ?? ''))
         } finally { controller.close() }
       }
     })
     return new Response(stream, { headers })
   })
````

3. **Docs check** (brave-search): confirm parameters (`stream: true`), SSE headers, and Ollama host usage.

## Phase 3 — Serve Locally & Test

1. **Serve** (docs):

   * `supabase functions serve --env-file /home/ali/Documents/IOT-Dashboards/.env`
   * Ensure `FN_ENV_DIR` contains `AI_INFERENCE_API_HOST`.
2. **Test** (docs curl style):

   ```bash
   curl --get "http://localhost:54321/functions/v1/chat" \
     --data-urlencode "prompt=Summarize the latest door sensor anomalies in one sentence" \
     -H "Authorization: Bearer $ANON_KEY"
   ```

   Expect HTTP 200 and streamed tokens.
3. **Post-step**: Insert 1 test row into `iot_events` (supabase MCP), app smoke-test, then save `_reports/chat_local_test.json` and `_reports/chat_local_test.md`.

## Phase 4 — (Optional) Deploy

1. **Set secret in project** (docs):

   * `supabase secrets set AI_INFERENCE_API_HOST=https://<your-llm-host>`
2. **Deploy** (docs): `supabase functions deploy chat`
3. **Test deployed** (docs curl style; project URL + \$ANON\_KEY). Capture latency and status.
4. Save `_reports/chat_deploy_test.md` with endpoints, timings, doc links.

## Phase 5 — Repo Fit & Minimal Wiring

1. Add a tiny client helper (optional) under `./lib/chat.ts` that calls the function endpoint with a prompt.
2. Keep changes minimal; **no schema changes**. Confirm RLS unaffected.
3. Update `README.md` (root) and `docs/` with a short “How to run chat” section.

## Validation Checklist (must pass)

* Chat function streams responses **locally** (HTTP 200) and (if chosen) **in prod**.
* All steps verified against **official docs** (links recorded in reports).
* No secrets printed; env handled via `.env` / function secrets.
* Repo still runs simulations and analytics unchanged; `_reports` updated.

## Deliverables

* `_reports/chat_preflight.md` (versions, models, doc links)
* `_reports/chat_local_test.json` + `_reports/chat_local_test.md` (request/response summary)
* `_reports/chat_deploy_test.md` (if deployed)
* Updated `README.md` + short `docs/` note on usage

## Success Criteria

* Chat endpoint working with **mistral** via Ollama using **AI Models** interface.
* Verified end-to-end against official docs; minimal, reversible changes.
* Clean integration with current repo and reporting discipline.

```
```
