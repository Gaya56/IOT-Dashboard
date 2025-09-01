---
mode: agent
---

# Step 9: Manufacturing Database Enhancement

Define the task to achieve, including specific requirements, constraints, and success criteria.

## Task

Implement Step 9: Manufacturing Database Enhancement for the IoT Dashboard project. Step 8 (dashboard development) has not yet been executed; instead, your team has completed Step 7 and confirmed that the simulation and analytics pipeline are working: over 50 events have been stored, and 39 devices across six sensor types are being monitored with enriched metadata. Before building the dashboard, you now need a more realistic, production‑ready data model. This step will design and create additional tables in Supabase that reflect a typical manufacturing or warehouse environment. The schema should capture device types, individual devices, their locations, manufacturers, and maintenance history, enabling future dashboards and AI integrations. You must also enhance the Node.js simulation so it generates events for a fleet of devices with meaningful metadata.

## Specific Requirements

### Database Schema Expansion

**`device_types` table:** contains `id` (primary key), `type_name` (e.g. Temperature Sensor, Vibration Sensor), and `description`. Use lowercase names with underscores. Vibration sensors in industry detect wear and misalignment by measuring frequency, velocity and amplitude ([builtin.com](https://builtin.com)). Include at least five realistic sensor types (temperature, humidity, vibration, pressure/proximity, gas). Insert seed data via SQL.

**`manufacturers` table:** holds `id` (primary key), `name`, `contact_info`, and optional `notes` about the company. Seed with a handful of fictional manufacturers.

**`locations` table:** stores `id` (primary key), `name` (e.g. "Warehouse A – Zone 1"), and `description`. Seed with several facility areas to distribute devices across a warehouse or plant.

**`devices` table:** the core registry. Columns should include `id` (primary key), `device_name` (human‑friendly name), `device_type_id` (foreign key references `device_types.id`), `location_id` (references `locations.id`), `manufacturer_id` (references `manufacturers.id`), `installation_date` (date), `battery_capacity` (numeric, e.g. mAh), `battery_level` (numeric percent), `last_calibration_date` (date), `status` (e.g. active, maintenance), `metadata` (JSON for extra fields), and `created_at` (timestamp with default now()). Use foreign key constraints to preserve referential integrity.

**`maintenance_records` table:** tracks work done on a device. Fields: `id` (primary key), `device_id` (foreign key), `maintenance_date` (timestamp), `maintenance_type` (text, e.g. calibration, repair, inspection), `notes`, and `created_at`. Ensure rows can be inserted by anon users for now.

Use Supabase SQL editor or migrations (via the Supabase server in MCP) to create these tables. Enable row‑level security on each new table and create permissive policies for anon so the simulation can read/write data ([supabase.com](https://supabase.com)).

Provide seed SQL statements in a `schema.sql` file or within the prompt's SQL examples.

### Update Simulation Script

Modify `simulate_iot.js` to read the new registry tables from Supabase or an in‑memory representation (e.g. a JSON file or in‑script array). It should randomly select a device from the registry, determine its sensor type, and generate realistic readings appropriate for that sensor (e.g. temperature range 15–35 °C, humidity 30–80 %, vibration amplitude 0–10 g, proximity state open/closed, gas concentration 0–100 ppm). Use the existing metadata enrichment but incorporate `device_name`, `location`, `manufacturer`, and `battery_level` changes as devices age.

Support CLI flags similar to previous steps (`iterations`, `delay`, `verbose`, `enrich‑metadata`). Optionally add a flag `--use-supabase-registry` that pulls the device list from the database instead of a static array.

Ensure events continue to insert into the `iot_events` table and that triggers update the summary tables.

### 🔍 Brave Search MCP

Before finalizing the new schema, use the MCP Brave Search tool (`browser.search` and `browser.open`) to consult official Postgres/Supabase documentation and reputable sources on industrial IoT databases and AI‑ready schemas. Verify best practices for naming conventions, foreign key relationships, partitioning, indexing, and modelling patterns or anomalies.

Research how to store pattern detections or anomaly reports in a relational database. If the documentation suggests storing pattern summaries separately, design an additional table (e.g. `pattern_events` or `anomaly_reports`) with fields such as `id`, `device_id`, `pattern_type`, `pattern_description`, `confidence_score`, `detected_at`, and `metadata`. Seed the table with example pattern types relevant to manufacturing (e.g. vibration anomaly, temperature drift, gas leak). Create row‑level security policies to permit reads and writes from your simulation and future AI.

Provide citations in your comments or commit messages for every new table or design choice, referencing the official documentation or research results. This ensures that the database is built on verified best practices and prepares it for future AI pattern detection.

### Enhance Analytics/Triggers

Review triggers from Step 7 and ensure they handle the additional sensor types (pressure/proximity, gas, etc.). You may need to update `sensor_stats` to include new types, or extend `device_health` to compute additional health metrics (e.g. vibration threshold alerts). Use row‑level triggers to automatically populate or update `sensor_stats` and `device_health` when `iot_events` are inserted ([supabase.com](https://supabase.com)).

Optionally create views or materialized views that join devices with their latest health data or maintenance records for easier querying and dashboard consumption. Supabase supports materialized views using standard Postgres syntax ([supabase.com](https://supabase.com)).

### Documentation & Configuration

Update the root `README.md` to describe the new tables (including any pattern/anomaly tables), their relationships, and how to seed them. Add instructions on running migrations or executing the provided SQL. Explain how the simulation picks from the device registry to generate events.

Extend `.env.example` with any new environment variables needed (e.g. additional Supabase service keys if required for seeding). Document how to set them up.

## Constraints

**Non‑breaking:** Do not remove existing tables or scripts. All new additions should coexist with previous steps. Maintain backward compatibility for analytics and simulation scripts.

**Supabase best practices:** Use foreign keys and generated always as identity columns; enable row‑level security; avoid service keys in client code. Seed data via SQL or Node script executed through the Supabase server.

**Modularity:** Keep simulation logic separate from database definition. Add new modules/files rather than overloading existing functions.

**Licensing & compatibility:** Use open‑source libraries with permissive licenses (MIT/Apache). Avoid vendor‑lock features outside Supabase.

## Success Criteria

- New tables (`device_types`, `manufacturers`, `locations`, `devices`, `maintenance_records`) exist in the Supabase database with correct columns, primary keys, and foreign key relationships.

- Row‑level security is enabled on all new tables, and simple policies allow anon inserts/reads as needed.

- The Node.js simulation script can insert events referencing actual devices from the new registry and produces realistic values for each sensor type. It still supports previous flags and metadata enrichment.

- Summary and health tables update correctly when new sensor types are introduced.

- Documentation is updated to explain the expanded schema, seeding process, and simulation adjustments. README describes how to run the script and where to configure the environment.