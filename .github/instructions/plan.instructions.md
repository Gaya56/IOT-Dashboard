---
applyTo: '**/home/ali/Documents/IOT-Dashboards'

---



# 📘 IoT Dashboard — AI Integration (Edge Functions + AI Models)

> **Purpose:** Add a simple, official-docs-only AI embedding function using Supabase Edge Functions. Keep setup minimal, verify each step against the **official website** with **brave-search**, and record concise results in `_reports/`. (Builds on our existing instruction manual.)&#x20;

---

## 🔑 Global Rules (must follow every step)

* **Always first**:

  1. Deep dive into **Supabase architecture**: confirm tables, relationships, triggers, and RLS policies.
  2. Review `/home/ali/Documents/IOT-Dashboards/_reports` for the latest validation reports.
* **Use ALL MCPs** each step:

  * `sequentialthinking` (plan)
  * `supabase` (queries, schema validation, inserts)
  * `brave-search` (verify in official Supabase docs)
  * `filesystem` (read/write reports)
  * `memory` (track lessons + state)
* **After each step**:

  * Insert 1 test row into `iot_events` and validate.
  * Run a short app smoke test.
  * Save a short summary + JSON into `_reports/`.

---

## 🧭 Pre‑flight

1. With **brave-search**, open and **read**:

   * **AI Models in Functions**: [https://supabase.com/docs/guides/functions/ai-models](https://supabase.com/docs/guides/functions/ai-models)
   * **Edge Functions Overview**: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
   * **Serve locally**: [https://supabase.com/docs/guides/functions/serve](https://supabase.com/docs/guides/functions/serve)
   * **Deploy functions**: [https://supabase.com/docs/guides/functions/deploy](https://supabase.com/docs/guides/functions/deploy)
   * **Manage secrets**: [https://supabase.com/docs/guides/functions/secrets](https://supabase.com/docs/guides/functions/secrets)
   * **CLI reference (functions)**: [https://supabase.com/docs/reference/cli](https://supabase.com/docs/reference/cli)
2. Confirm local stack is up (CLI): `npx supabase --help`, `supabase start`.

---

## 🚀 Phase A — Scaffold a Minimal AI Function

1. **Scaffold** (CLI):

   ```bash
   supabase functions new embedder
   ```
2. **Verify docs** (brave-search → *AI Models in Functions*). Copy the **official sample** that creates a session (e.g., model `"gte-small"`) and returns embeddings.
3. **Implement** in `functions/embedder/index.ts` (or `.ts/.js`) exactly as shown in docs.

   * Keep handler tiny: accept `{ input }`, run model, return JSON.
   * **Do not** print secrets.

**Artifacts:** `_reports/ai_fn_scaffold.md` (what you created + links used).

---

## 🧪 Phase B — Local Test (Serve)

1. **Serve** locally (docs):

   ```bash
   supabase functions serve --env-file /home/ali/Documents/IOT-Dashboards/.env
   ```

   (Use the docs’ flags as required; if JWT verification is needed, follow the guide.)
2. **Call** the function with a tiny payload (docs show curl example). Save response.
3. **Optional**: write a minimal `event_embeddings` table (JSONB) and store one embedding linked to a test `iot_events.id` (keep it simple; no schema changes if not needed).

**Artifacts:** `_reports/ai_fn_local_test.json` (request/response, redacted).

---

## ☁️ Phase C — Deploy & Secrets

1. **Set secrets** (docs):

   ```bash
   supabase functions secrets set SUPABASE_URL=... SUPABASE_ANON_KEY=...
   ```

   *(Only what the docs require. Never print values.)*
2. **Deploy** (docs):

   ```bash
   supabase functions deploy embedder
   ```
3. **Test** the deployed function with a small request (docs example). Log latency + status.

**Artifacts:** `_reports/ai_fn_deploy_test.md` (endpoint, status, doc links).

---

## ✅ Success Criteria

* AI function responds locally **and** when deployed (HTTP 200, valid JSON).
* Steps traced to the **official docs** (URLs captured in reports).
* No secrets leaked; repo remains minimal.
* Post‑step DB insert + smoke tests completed and logged.

---

## 🔗 Official Docs (reference these via brave-search each step)

* AI Models in Functions: [https://supabase.com/docs/guides/functions/ai-models](https://supabase.com/docs/guides/functions/ai-models)
* Functions Overview: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
* Serve Locally: [https://supabase.com/docs/guides/functions/serve](https://supabase.com/docs/guides/functions/serve)
* Deploy Functions: [https://supabase.com/docs/guides/functions/deploy](https://supabase.com/docs/guides/functions/deploy)
* Function Secrets: [https://supabase.com/docs/guides/functions/secrets](https://supabase.com/docs/guides/functions/secrets)
* CLI Reference (functions): [https://supabase.com/docs/reference/cli](https://supabase.com/docs/reference/cli)
* JavaScript Client (for functions if needed): [https://supabase.com/docs/reference/javascript/install](https://supabase.com/docs/reference/javascript/install)

---

**Keep it simple.** Verify with official docs **before** executing each command, execute, then summarize and move on.
