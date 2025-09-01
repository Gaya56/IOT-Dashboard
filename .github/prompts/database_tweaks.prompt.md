---
mode: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.
# Database Tweaks for IoT Simulation

## Objective
1) **Standardize simulation device IDs** to a single convention `device_{type}_{seq}`.  
2) **Add realistic time-series temperature patterns** (daily cycles, optional seasonal drift).  
3) **Guarantee relational integrity** so **all** referencing tables remain perfectly consistent.

## Tools to use
- `sequentialthinking`, `memory`
- `filesystem` (write reports/migrations)
- `supabase` MCP (DDL/DML, introspection)
- `brave-search` (official Postgres/Supabase docs only, for FK/constraints and time-series best practices)

## Inputs
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (never print)
- `REPORTS_DIR` = `./_reports`
- **Convention**: `device_{type_slug}_{seq}` (3-digit, zero-padded; ex: `device_temp_001`)

## Plan & Procedure
1) **Discover & Plan**
   - Introspect schema: list tables with a `device_id` FK (e.g., `iot_events`, `device_health`, `sensor_stats`, `maintenance_records`, `pattern_events`, etc.).
   - Check FK actions (expect `ON UPDATE CASCADE`). If absent, plan manual multi-table updates inside a single transaction with **DEFERRABLE INITIALLY DEFERRED** constraints.
   - Identify **simulation devices** (heuristics: non-conforming IDs OR marked as simulated in metadata). Snapshot current IDs.

2) **Build ID Mapping**
   - For each simulation device: derive `type_slug` from `devices.type_id → device_types.slug` (fallback to lowercase name).  
   - Allocate a sequential 3-digit number per `type_slug`.  
   - Create (or replace) table `_ops_device_id_renames(old_id TEXT PRIMARY KEY, new_id TEXT UNIQUE, applied_at TIMESTAMPTZ)`.
   - Populate mapping; ensure **no collisions** with existing IDs.

3) **Apply Renames (Transactional)**
   - `BEGIN; SET CONSTRAINTS ALL DEFERRED;`
   - If **ON UPDATE CASCADE** on `devices.device_id` exists:  
     - `UPDATE devices SET device_id = map.new_id FROM _ops_device_id_renames map WHERE devices.device_id = map.old_id;`
     - Else: update **all child tables** explicitly using the mapping, then update `devices`.  
   - Re-validate: counts match; zero orphan FKs; zero duplicates.  
   - `COMMIT;`

4) **Time-Series Temperature Patterns (Simple & Realistic)**
   - Parameters (per location or global defaults):  
     - `base_c` (e.g., 19–24°C), `amplitude_c` (e.g., 3–6°C), `phase_offset_hours` by location, `noise_sd` (~0.3–0.6°C).  
   - Create SQL function `compute_diurnal_temp(ts timestamptz, base_c real, amp_c real, phase_hours real, noise_sd real)` returning `real` using `sin(2π*(extract(epoch from ts)/86400 + phase_hours/24)) + gaussian_noise`.  
   - **Update pass (non-destructive):** only adjust rows where `type='temperature'` and **not** flagged `sensor_error`, preserving min/max realism:  
     ```sql
     UPDATE iot_events e
     SET value = GREATEST( -10,  LEAST( 45,
       compute_diurnal_temp(e.timestamp, 22, 4, COALESCE(loc.phase_hours,0), 0.4)
     ))
     FROM devices d
     JOIN locations loc ON d.location_id = loc.id
     WHERE e.device_id = d.device_id AND e.type = 'temperature' AND (e.status IS NULL OR e.status <> 'sensor_error');
     ```
   - Optional: add mild **seasonal drift** (+/-1.5°C over 365 days).

5) **Validation**
   - Confirm **all** tables referencing `device_id` have **0** orphan rows.
   - Verify **100%** IDs match regex `^device_[a-z0-9]+_\d{3}$`.
   - Recompute temperature stats: realistic range (≈15–30°C indoor), diurnal variance present.
   - Save artifacts:
     - `${REPORTS_DIR}/id_standardization_report.json`
     - `${REPORTS_DIR}/temperature_timeseries_update.json`
     - `${REPORTS_DIR}/post_fix_validation.md`

## Deliverables
- Mapping table + counts (renamed devices, updated rows per table).
- Temperature stats before/after (min/max/avg, variance, sample rows).
- One-paragraph summary of changes.

## Success Criteria
- **0 FK violations**, **0 orphan rows**, **0 duplicate device IDs**.
- **100%** simulation IDs follow `device_{type_slug}_{seq}`.
- Temperature data shows **clear daily cycles** within realistic indoor bounds.
