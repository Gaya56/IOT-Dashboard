---
applyTo: '**/home/ali/Documents/IOT-Dashboards'

---

# 📘 IoT Dashboard Instruction Manual (Updated)
## 📋 Short Overview

* **Goal**: Set up the **Supabase CLI** (understand its purpose, install, init, start local stack, confirm connectivity), then move to **AI integration** via a Supabase **Edge Function** that uses built-in AI models for embeddings—referencing only official docs.
* **Docs to follow**:
  * CLI: [https://supabase.com/docs/guides/local-development/cli/getting-started](https://supabase.com/docs/guides/local-development/cli/getting-started)
  * AI models in functions: [https://supabase.com/docs/guides/functions/ai-models](https://supabase.com/docs/guides/functions/ai-models)
* **CLI Checklist**: `npx supabase --help` → `supabase init` → `supabase start` (Docker running) → set env (`SUPABASE_URL`, keys) → quick DB sanity (`select now();`, insert 1 test row into `iot_events`).
* **AI Next**: Scaffold `supabase functions new embedder`, call `Supabase.ai.Session('gte-small')`, deploy/serve, send a test request, store an embedding row.
* **Agent behavior**: Use **brave-search** only to verify those two official doc URLs; save short summaries + JSON to `_reports/` after each step; keep it minimal and safe.
* **Context**: Fits our updated instruction manual and step discipline.

When you're ready, I'll draft **Prompt 1** (CLI setup + quick connection test) exactly against the official docs and our rules.

## 🔑 Global Rules

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

## 🚀 Phase 1 — Supabase CLI Setup

1. Install/verify CLI: `npx supabase --help`

   * Doc: [Supabase CLI Getting Started](https://supabase.com/docs/guides/local-development/cli/getting-started)
2. Init & start local stack: `supabase init` → `supabase start` (ensure Docker running).
3. Validate schema matches reports + deep dive step.

---

## 🧠 Phase 2 — Database Schema & Security

* Ensure schema matches Step 2 of the plan.
* Validate RLS policies enabled.
* Doc: [Tables and Data](https://supabase.com/docs/guides/database/tables), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

---

## ⚙️ Phase 3 — IoT Simulation & Metadata

* Run `npm run simulate` to insert sample events.
* Validate in Supabase dashboard.
* Add enhanced metadata (battery, calibration, manufacturer, health).
* Doc: [Postgres Changes & Realtime](https://supabase.com/docs/guides/realtime/postgres-changes).

---

## 📊 Phase 4 — Analytics & Health Monitoring

* Confirm triggers update `sensor_stats` + `device_health`.
* Run `analyze_data.js` to generate updated `_reports/analysis.json`.

---

## 🖥️ Phase 5 — Dashboard Frontend

* Implement real-time subscriptions for charts & device health.
* Doc: [Creating API Routes](https://supabase.com/docs/guides/api/creating-routes).

---

## 🧪 Step Completion Summary (Template)

```
## ✅ Step [X] Summary: [Name]
- Objectives completed
- Schema & _reports check: PASS/FAIL
- Supabase test insert: PASS/FAIL
- App smoke test: PASS/FAIL
- Docs referenced: [links]
- MCPs used: ST | SB | BS | FS | MEM
- Key insights
- Next step
```

---

Do you want me to now **turn this into an Agent Prompt (mode: agent)** so your Copilot automatically enforces the “deep dive architecture + reports check” at the start of every step?
