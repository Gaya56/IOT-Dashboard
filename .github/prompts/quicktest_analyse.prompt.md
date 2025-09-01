---
mode: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.Objective

Analyze the repository docs/README and Supabase project.

Smoke-test the application locally.

Insert 100 test rows into the Supabase database (non-destructive).

Produce a concise architecture overview (schema, functions, policies, relationships).

Tools you MUST use

filesystem for reading project files.

sequentialthinking to plan and track steps.

memory to store findings.

brave-search only for official docs linked in the repo/README.

supabase MCP server for SQL/schema introspection and data ops.

Inputs (set or autodetect)

PROJECT_ROOT: <path to repo root>

README_PATH: ${PROJECT_ROOT}/README.md

SUPABASE_URL: <url>

SUPABASE_SERVICE_ROLE_KEY: <key> (use securely; never print)

TARGET_TABLE: <table to receive test data> (infer from schema; prefer a seed/demo table like sensor_readings or events)

ROW_COUNT: 100

Procedure

Plan (sequentialthinking): outline steps; add checkpoints.

Read docs (filesystem): parse README.md, /docs/**, and any *.md under the repo for setup, scripts, env vars, and database notes. Save key findings to memory.

Schema introspection (supabase MCP):

List schemas, tables, columns, PK/FK, indexes, RLS policies, triggers, RPCs, Edge Functions, and Storage buckets.

Build an ERD summary (textual).

App smoke test:

If a web/app project is detected: run install and dev/start commands from README (e.g., npm i, npm run dev).

Hit the health/status route or home page locally if available; capture logs and any obvious errors. Do not block; 3–5 minute max attempt.

Insert test data (supabase MCP):

Choose TARGET_TABLE:

Prefer a table named in README or one with columns that support synthetic data (non-nullable fields).

If multiple candidates, pick the one with the clearest sample/seed usage.

Generate ROW_COUNT=100 realistic but fake rows (no PII). Respect constraints (defaults, enums, FKs). Use UPSERT if safe; otherwise insert in batches of ≤25.

Do not modify schema. Do not disable RLS; if RLS blocks inserts, create rows via a callable RPC or use service role.

Verify row count before/after; report delta.

Security: never echo secrets; redact keys in output.

Artifacts:

Save a brief machine-readable report to ${PROJECT_ROOT}/_reports/supabase_inspect.json.

Save a human summary to ${PROJECT_ROOT}/_reports/overview.md.

Deliverables (reply here)

Architecture Overview (≤250 words): project layout, key services, high-level data flow.

Database Summary:

Tables (name → columns, PK, FKs), relationships, policies, triggers, RPCs/Edge Functions.

Test Execution Notes: commands run, health check result, notable logs.

Data Insertion Result: table used, rows inserted, method (insert/upsert), any constraints handled, verification query results.

Follow-ups: top 3 risks / TODOs.

Success Criteria

Accurate parsing of README/docs.

Verified schema listing from Supabase MCP.

100 new rows added to the chosen table and counted.

Clear, concise overview + saved artifacts.

No secrets leaked; no destructive or schema-changing actions.