---
applyTo: '**/home/ali/Documents/IOT-Dashboards'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# IoT Dashboard Development Plan

A comprehensive guide for building an IoT monitoring dashboard with Supabase backend and Node.js simulation.

## Plan Overview

1. **Create Supabase project + get API URL & keys** (Settings → API). ([Supabase][1])
2. **Create database schema** (SQL Editor). Keep names lowercase\_with\_underscores. ([Supabase][2])
3. **Enable RLS + policies** for secure data access. ([Supabase][3])
4. **Node.js simulation setup**: environment configuration and dependency management.
5. **IoT data simulation** with automated sensor data generation.
6. **Testing and validation** of data insertion and retrieval.
7. **(Optional) Realtime** for live monitoring. ([Supabase][4])
8. **Later**: advanced features like alerting (SQL triggers or edge functions).

---

## Step 1 — Supabase Project & API Keys (≤150 words)

1. Go to **app.supabase.com → New project**.
2. After project creation: **Settings → API**. Copy:

   * **Project URL** (base URL for API calls)
   * **anon** key (public key for client-side access)

Environment variables needed:

* `SUPABASE_URL = <Project URL>`
* `SUPABASE_ANON_KEY = <anon key>`

Keep this information secure and use environment variables for configuration. ([Supabase][1])

---

## Step 2 — Database Schema Creation

**SQL** to create the IoT events table:

```sql
create table public.iot_events (
  id bigint generated always as identity primary key,
  device_id text not null,
  type text check (type in ('temperature','door','card','humidity','motion','smoke')),
  value numeric,
  status text,
  metadata jsonb,
  created_at timestamptz default now()
);
alter table public.iot_events enable row level security;
create policy "allow_anon_insert" on public.iot_events for insert to anon with check (true);
create policy "allow_anon_select" on public.iot_events for select to anon using (true);
create policy "allow_anon_update" on public.iot_events for update to anon using (true);
create policy "allow_anon_delete" on public.iot_events for delete to anon using (true);
```

([Supabase][2])

---

## Step 3 — Node.js Environment Setup

1. **Initialize Node.js project**:
   ```bash
   npm init -y
   npm install axios dotenv
   npm install --save-dev nodemon
   ```

2. **Create environment configuration**:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials
   - Ensure `.env` is in `.gitignore`

3. **Package.json scripts**:
   ```json
   {
     "scripts": {
       "simulate": "node simulate_iot.js",
       "simulate:verbose": "node simulate_iot.js --verbose",
       "dev": "nodemon simulate_iot.js"
     }
   }
   ```

---

## Step 4 — IoT Data Simulation

Create `simulate_iot.js` for automated sensor data generation:

- **Six sensor types**: temperature, door, card, humidity, motion, smoke
- **Realistic data ranges**: appropriate values for each sensor type
- **Configurable parameters**: iterations, delay, verbose logging
- **Error handling**: robust HTTP request handling and validation
- **Verification**: query database to confirm data insertion

### Sensor Data Specifications:

| Type | Value Range | Status Examples | Metadata Fields |
|------|-------------|----------------|----------------|
| Temperature | 10-35°C | active, inactive | location, unit, calibration |
| Door | 0/1 (closed/open) | open, closed | entrance, door_type, access_level |
| Card | 8-digit numbers | read_success, read_error | scanner, card_type, encryption |
| Humidity | 0-100% | normal, high_humidity | zone, unit, sensor_model |
| Motion | 0/1 (no motion/detected) | motion_detected, no_motion | corridor, range, sensitivity |
| Smoke | 0-10 ppm | safe, alert | fire_zone, unit, alarm_threshold |

---

## Step 5 — Testing and Validation

1. **Run simulation**:
   ```bash
   npm run simulate
   # or with custom parameters
   node simulate_iot.js --iterations=50 --delay=200 --verbose
   ```

2. **Verify data insertion**:
   - Check Supabase dashboard table view
   - Query recent records via SQL
   - Validate sensor data formats and ranges

3. **Performance testing**:
   - Test with different iteration counts
   - Monitor API response times
   - Verify error handling

---

## Development Guidelines

### Code Standards
- Use `async/await` for asynchronous operations
- Implement proper error handling with try-catch blocks
- Include meaningful console logging for debugging
- Follow Node.js best practices for environment configuration

### Security Considerations
- Never commit `.env` files to version control
- Use Row Level Security policies for data protection
- Validate input data before database insertion
- Keep API keys secure and rotate regularly

### Project Structure
- Keep simulation scripts in project root
- Use `/docs` for API documentation
- Store configuration templates as `.example` files
- Maintain clear README with setup instructions

[1]: https://supabase.com/docs/guides/api/creating-routes?utm_source=chatgpt.com "Creating API Routes | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/tables?utm_source=chatgpt.com "Tables and Data | Supabase Docs"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
[4]: https://supabase.com/docs/guides/realtime/postgres-changes?utm_source=chatgpt.com "Postgres Changes | Supabase Docs"