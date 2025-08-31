---
applyTo: '**/home/ali/Documents/IOT-Dashboards'
---

# IoT Dashboard Development Plan

A comprehensive guide for building an IoT monitoring dashboard with Supabase backend and Node.js simulation.

---

## 🚀 MANDATORY DEVELOPMENT METHODOLOGY

### MCP Server Utilization Requirements
For EVERY prompt and step, AI MUST use ALL available MCP servers:

1. **🔧 Sequential Thinking MCP**: Plan, analyze, and organize complex tasks
2. **🗃️ Supabase MCP**: Database operations, migrations, queries, and testing
3. **🔍 Brave Search MCP**: Verify official documentation and best practices
4. **📁 Filesystem MCP**: File operations, reading, writing, directory management
5. **🧠 Memory MCP**: Track progress, store insights, maintain project knowledge

### 🔍 COMPREHENSIVE TESTING PROTOCOL
**Before Every Step:**
- Validate current project state using filesystem and supabase MCPs
- Search for latest best practices using brave search MCP
- Record current status in memory MCP

**After Every Step:**
- Test functionality using appropriate MCP servers
- Validate data integrity in Supabase
- Update memory with completion status and lessons learned

### 📋 STEP COMPLETION SUMMARY FORMAT

```markdown
## ✅ Step [X] Summary: [Step Name]

**🎯 Objectives Completed:**
- [ ] Objective 1
- [ ] Objective 2

**🧪 Testing Results:**
- [ ] Pre-step validation: PASS/FAIL
- [ ] Implementation: PASS/FAIL
- [ ] Post-step testing: PASS/FAIL

**📊 Project Overview Checklist:**
- [ ] Database Schema (Step 2)
- [ ] RLS Policies (Step 3)
- [ ] Node.js Environment (Step 4)
- [ ] IoT Simulation (Step 5)
- [ ] Enhanced Metadata (Step 6)
- [ ] Analytics & Health Monitoring (Step 7)
- [ ] Dashboard Frontend (Step 8)

**🔧 MCP Servers Used:**
- [ ] Sequential Thinking: Planning and analysis
- [ ] Supabase: Database operations
- [ ] Brave Search: Documentation verification
- [ ] Filesystem: File operations
- [ ] Memory: Progress tracking

**💡 Key Insights:**
- Technical learnings and issues resolved

**🚀 Next Steps:**
- Immediate next actions
```

### 🏆 INDUSTRY STANDARDS COMPLIANCE
All development must follow 2025 IoT best practices:
- **Standards Compliance**: Matter, ISO/IEC 30141, OWASP IoT Top 10
- **Security Standards**: HIPAA, GDPR, ISO compliance
- **Testing Tools**: IoT simulators for controlled environments

## Plan Overview

1. **Create Supabase project + get API URL & keys**
2. **Create database schema** (lowercase_with_underscores)
3. **Enable RLS + policies** for secure data access
4. **Node.js simulation setup**: environment configuration
5. **IoT data simulation** with automated sensor data generation
6. **Enhanced metadata features** with device registry and health monitoring
7. **Analytics & health monitoring** with automated summary tables
8. **Dashboard frontend** with real-time monitoring and visualization
9. **Advanced features**: alerting, AI integration, and edge functions

---

## Step 1 — Supabase Project & API Keys

1. Go to **app.supabase.com → New project**
2. **Settings → API**, copy:
   * **Project URL** (base URL for API calls)
   * **anon** key (public key for client-side access)

Environment variables:
* `SUPABASE_URL = <Project URL>`
* `SUPABASE_ANON_KEY = <anon key>`

---

## Step 2 — Database Schema Creation

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

---

## Step 3 — Node.js Environment Setup

1. **Initialize project**:
   ```bash
   npm init -y
   npm install axios dotenv
   npm install --save-dev nodemon
   ```

2. **Package.json scripts**:
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

Create `simulate_iot.js` with:
- **Six sensor types**: temperature, door, card, humidity, motion, smoke
- **Realistic data ranges** and configurable parameters
- **Error handling** and database verification

### Sensor Data Specifications:

| Type | Value Range | Status Examples |
|------|-------------|----------------|
| Temperature | 10-35°C | active, inactive |
| Door | 0/1 (closed/open) | open, closed |
| Card | 8-digit numbers | read_success, read_error |
| Humidity | 0-100% | normal, high_humidity |
| Motion | 0/1 (no motion/detected) | motion_detected, no_motion |
| Smoke | 0-10 ppm | safe, alert |

---

## Step 5 — Testing and Validation

1. **Run simulation**: `npm run simulate`
2. **Verify data**: Check Supabase dashboard, validate formats
3. **Performance testing**: Monitor API response times

---

## Step 6 — Enhanced Metadata Features

### Enhanced Metadata Fields
- **device_name**: Human-friendly device names
- **location**: Realistic room/zone identifiers
- **battery_level**: Current battery percentage (0-100%)
- **last_calibration**: Recent calibration date
- **manufacturer**: Random manufacturer from predefined companies
- **system_health**: Health status ('good', 'warning', 'critical')

### Device Registry System
- **Consistent Metadata**: Same device properties across runs
- **Battery Degradation**: Realistic simulation with degradation
- **Health Calculation**: Based on battery levels and sensor readings
- **Configuration**: `--enrich-metadata` (default), `--no-enrich-metadata` for compatibility

---

## Step 7 — Analytics & Health Monitoring

### Summary Tables

#### sensor_stats Table
```sql
create table public.sensor_stats (
  type text primary key,
  event_count bigint default 0,
  min_value numeric,
  max_value numeric,
  avg_value numeric,
  last_updated timestamptz default now()
);
```

#### device_health Table
```sql
create table public.device_health (
  device_id text primary key,
  latest_battery_level numeric,
  last_calibration timestamptz,
  manufacturer text,
  health_status text check (health_status in ('good', 'warning', 'critical')),
  last_updated timestamptz default now()
);
```

### Trigger Functions
- **update_sensor_stats()**: Updates aggregated sensor statistics
- **update_device_health()**: Maintains current device health status
- **Row-level triggers**: Execute on each `iot_events` insert/update

### Analytics Script
Create `analyze_data.js` with:
- **Summary Statistics**: Total events, sensor distributions, battery analytics
- **Health Monitoring**: Device status overview, maintenance alerts
- **Report Generation**: Console output, JSON/Markdown exports
- **Command-line Options**: `--report-file`, `--format`, `--verbose`

---

## Step 8 — Dashboard Frontend

### Core Features
- **Real-time Data**: Live sensor readings and device status
- **Interactive Charts**: Time series, distributions, health metrics
- **Device Management**: Individual monitoring and alerts

### Technical Implementation
- **Frontend Framework**: React/Vue.js with modern architecture
- **Real-time Updates**: Supabase real-time subscriptions
- **Data Visualization**: Chart.js/D3.js for interactive analytics

---

## Development Guidelines

### Code Standards
- Use `async/await` for asynchronous operations
- Implement comprehensive error handling with try-catch blocks
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

[1]: https://supabase.com/docs/guides/api/creating-routes "Creating API Routes | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/tables "Tables and Data | Supabase Docs"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security "Row Level Security | Supabase Docs"
[4]: https://supabase.com/docs/guides/realtime/postgres-changes "Postgres Changes | Supabase Docs"