---
mode: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.

## Objective
1) **Test the repo first** to capture a baseline.
2) Identify and remove files not needed to run/build/test the app (no functionality changes).
3) Update `/home/ali/Documents/IOT-Dashboards/docs` and `_reports` with fresh, concise summaries.

## Scope & Paths
- Project root: `/home/ali/Documents/IOT-Dashboards`
- Docs: `/home/ali/Documents/IOT-Dashboards/docs`
- Reports: `/home/ali/Documents/IOT-Dashboards/_reports`

## Tools
- `sequentialthinking`, `memory`
- `filesystem` (read/write, delete)
- `brave-search` (only to confirm official Supabase/Node best practices)
- `supabase` MCP (quick DB sanity checks)

## Procedure
1) **Baseline Test**
   - Read README/scripts; install deps; run tests and app smoke (`npm test`, `npm run simulate`/`dev` as defined).
   - Save outputs: `_reports/test_baseline.json` (key logs, exit codes).

2) **Inventory & Dry-Run Cleanup**
   - List unused scripts, temp ops artifacts (e.g., old migrations, logs, `_ops_device_id_renames` leftovers), dead code (unreferenced by imports/scripts).
   - Produce `_reports/deletion_plan.json` (reason per file). **Do not delete yet**.

3) **Apply Cleanup (Safe)**
   - Delete only items in the plan. Never touch `.env`, config, schema, or runtime assets.
   - Re-run tests + smoke. Save `_reports/test_after_cleanup.json`.
   - If any regression → restore from plan and note exceptions.

4) **Docs & Reports Update**
   - Update root `README.md` to current run instructions and link to `docs/` and `_reports/`.
   - Refresh `docs/` overview (setup, CLI, schema, simulation).
   - Create `_reports/index.md` summarizing latest reports.

## Deliverables
- `_reports/test_baseline.json`, `_reports/deletion_plan.json`, `_reports/test_after_cleanup.json`
- Updated `README.md`, refreshed `docs/`, `_reports/index.md`

## Success Criteria
- Tests & smoke pass **before and after** cleanup.
- App behavior unchanged; repo size reduced.
- Docs/readmes match actual commands; reports are current and concise.
