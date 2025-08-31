---
mode: agent
---

# Step 7: Analytics & Health Monitoring Implementation

## 📋 Project Overview

This document defines the current state of the IoT Dashboard project and the tasks for **Step 7: Analytics & Health Monitoring**. It serves as a guide for implementing automated analytics and health monitoring capabilities.

### Current Project State

The repository contains:
- **Node.js simulation script** (`simulate_iot.js`) that streams IoT sensor events to Supabase
- **PostgreSQL database** with `iot_events` table storing data from six sensor types
- **Enhanced metadata** including device name, location, battery level, last calibration, manufacturer, and system health
- **Row Level Security (RLS)** enabled with permissive policies for the `anon` role
- **Environment configuration** for secure API access
- **Comprehensive documentation** with setup instructions

✅ **Current Status**: Data insertion successful, ready for analytics and dashboard development

---

## 🎯 Step 7 Goals

**Implement a Simple Hybrid Approach for analytics and health monitoring:**

1. **Automated Summary Tables**: Build self-updating summary tables in Supabase for real-time aggregated metrics
2. **Analytics Script**: Create comprehensive statistics and health indicators computation
3. **Documentation Updates**: Reflect new components and usage instructions

---

## 📊 Requirements and Tasks

### 1. Create Summary Tables

Define two new tables in the `public` schema:

#### `sensor_stats` Table
**Purpose**: Aggregated statistics per sensor type

**Schema**:
- `type` (text, primary key) - Sensor type identifier
- `event_count` (bigint) - Total number of events
- `min_value` (numeric) - Minimum recorded value
- `max_value` (numeric) - Maximum recorded value
- `avg_value` (numeric) - Average value
- `last_updated` (timestamptz) - Last update timestamp

#### `device_health` Table
**Purpose**: Per-device health metrics and status

**Schema**:
- `device_id` (text, primary key) - Unique device identifier
- `latest_battery_level` (numeric) - Current battery percentage
- `last_calibration` (timestamptz) - Most recent calibration date
- `manufacturer` (text) - Device manufacturer
- `health_status` (text) - Calculated health status ('good', 'warning', 'critical')
- `last_updated` (timestamptz) - Last update timestamp

**Design Requirements**:
- Use appropriate data types (`numeric`, `timestamptz`, etc.)
- All column names must be `lowercase_with_underscores`
- Implement proper primary keys and constraints

### 2. Write Trigger Functions

Implement PostgreSQL trigger functions to automatically update summary tables when `iot_events` changes.

#### Trigger Function: `update_sensor_stats()`
**Purpose**: Update sensor statistics on new events

**Functionality**:
- Accept no arguments, reference `NEW` record
- Increment event count for the relevant sensor type
- Update min/max/average values based on new data
- Refresh `last_updated` timestamp
- Return `NEW` record

**Language**: PL/pgSQL

#### Trigger Function: `update_device_health()`
**Purpose**: Update device health metrics

**Functionality**:
- Extract device information from `NEW.device_id`
- Update battery level, calibration date, manufacturer
- Calculate health status:
  - `'good'`: battery ≥ 20%
  - `'warning'`: battery < 20%
  - `'critical'`: battery < 10% or other issues
- Update `last_updated` timestamp

### 3. Create Triggers

Implement row-level triggers for automatic updates:

```sql
-- Sensor statistics trigger
CREATE TRIGGER update_sensor_stats_trigger
  AFTER INSERT ON public.iot_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sensor_stats();

-- Device health trigger  
CREATE TRIGGER update_device_health_trigger
  AFTER INSERT ON public.iot_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_device_health();
```

**Additional Considerations**:
- Add `AFTER UPDATE` triggers if sensor values or battery levels can change
- Use `FOR EACH ROW` to ensure functions run for every inserted/updated row
- Consider `FOR EACH STATEMENT` for bulk operations if needed

### 4. Implement Analytics Script

Create `analyze_data.js` in the repository root.

#### Core Functionality
- **Environment Configuration**: Read `SUPABASE_URL` and `SUPABASE_ANON_KEY` from existing `.env`
- **API Integration**: Use `axios` to call Supabase REST API endpoints:
  - `/rest/v1/sensor_stats`
  - `/rest/v1/device_health`
  - `/rest/v1/iot_events` (for deeper analytics)

#### Analytics Capabilities
- **Summary Statistics**: Total events, average temperature, battery level distributions
- **Health Monitoring**: Device health status overview, low battery alerts
- **Trend Analysis**: Daily event counts, manufacturer distribution
- **Report Generation**: Console output and file export (JSON/Markdown)

#### Technical Requirements
- **Error Handling**: Comprehensive try-catch blocks
- **Configurability**: Command-line arguments (`--report-file`, `--format`, `--verbose`)
- **Compatibility**: Must not interfere with existing simulation logic
- **Modularity**: Clear function structure for maintainability

### 5. Documentation Updates

#### README.md Updates
- **Summary Tables**: Document `sensor_stats` and `device_health` tables
- **Triggers**: Explain automatic update mechanisms
- **Analytics Script**: Usage instructions and examples
- **Installation**: Update `npm install` instructions if needed
- **Usage Examples**:
  ```bash
  npm run simulate          # Run IoT simulation
  node analyze_data.js      # Generate analytics report
  node analyze_data.js --report-file=report.json --verbose
  ```

#### Instructions File Updates
- Update this document to reflect Step 7 completion
- Add guidance for Step 8 (dashboard development)
- Include AI integration considerations

#### Environment Variables
- Update `.env.example` if new variables are required
- Document any additional configuration options

### 6. Success Criteria

**Database Components**:
- [ ] `sensor_stats` table created with proper schema
- [ ] `device_health` table created with proper schema
- [ ] `update_sensor_stats()` trigger function implemented and tested
- [ ] `update_device_health()` trigger function implemented and tested
- [ ] Triggers created and firing correctly on `iot_events` changes

**Analytics Script**:
- [ ] `analyze_data.js` created and functional
- [ ] Successfully connects to Supabase and retrieves data
- [ ] Computes comprehensive statistics from summary tables
- [ ] Generates reports in multiple formats (console, JSON, Markdown)
- [ ] Handles errors gracefully and provides meaningful feedback

**Documentation**:
- [ ] README.md updated with Step 7 components
- [ ] Instructions file reflects new project state
- [ ] All usage examples tested and verified
- [ ] Environment configuration documented

**Quality Assurance**:
- [ ] All changes committed to Git with clear messages
- [ ] Backward compatibility maintained
- [ ] No breaking changes to existing functionality
- [ ] Code follows established naming conventions

---

## 🔒 Constraints and Guidelines

### SQL Development
- **Idempotency**: Use `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`
- **Error Handling**: Implement proper exception handling in PL/pgSQL functions
- **Performance**: Consider indexing for frequently queried columns
- **Naming**: Consistent `lowercase_underscore` convention

### Backward Compatibility
- **Simulation Script**: `simulate_iot.js` must continue working unchanged
- **Environment**: No breaking changes to existing `.env` configuration
- **API**: Maintain existing Supabase REST API functionality

### Code Quality
- **Functions**: Clear, well-documented functions with single responsibilities
- **Error Handling**: Comprehensive error catching and meaningful messages
- **Logging**: Appropriate console output for debugging and monitoring
- **Testing**: Validate functionality before committing changes

---

## 📚 References and Resources

### Supabase Documentation
- [Postgres Triggers](https://supabase.com/docs/guides/database/postgres/triggers)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [REST API Reference](https://supabase.com/docs/reference/javascript/select)

### PostgreSQL Resources
- [PL/pgSQL Documentation](https://www.postgresql.org/docs/current/plpgsql.html)
- [Trigger Functions](https://www.postgresql.org/docs/current/trigger-definition.html)
- [Aggregate Functions](https://www.postgresql.org/docs/current/functions-aggregate.html)

### Best Practices
- Minimize side effects in trigger functions
- Use appropriate data types for optimal performance
- Implement comprehensive error handling
- Document complex business logic clearly