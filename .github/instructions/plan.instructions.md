---
applyTo: '**/home/ali/Documents/IOT-Dashboards'

---

# 📘 IoT Dashboard Instruction Manual (Updated)

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
