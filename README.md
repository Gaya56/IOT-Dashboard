# IoT Dashboard

A real-time IoT monitoring dashboard built with Supabase backend for collecting and visualizing sensor data from various IoT devices.

## Overview

This project provides a comprehensive IoT data collection and monitoring system that can handle multiple types of sensors including:

- Temperature sensors
- Door sensors
- Card readers
- Humidity sensors
- Motion detectors
- Smoke detectors

## Features

- **Node.js Data Simulation**: Automated IoT sensor data generation and transmission
- **Real-time Data Collection**: Live sensor data ingestion via REST API
- **Supabase Backend**: Robust PostgreSQL database with Row Level Security
- **API Documentation**: Comprehensive API reference for all operations
- **Flexible Schema**: JSONB metadata support for extensible device information
- **Configurable Simulation**: Customizable iterations, delays, and sensor types

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gaya56/IOT-Dashboard.git
   cd IOT-Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run IoT simulation**
   ```bash
   # Default: 20 iterations, 500ms delay
   npm run simulate
   
   # Custom configuration
   node simulate_iot.js --iterations=50 --delay=200 --verbose
   ```

## IoT Data Simulation

The `simulate_iot.js` script generates realistic sensor data for six device types:

| Sensor Type | Value Range | Status Examples | Metadata |
|-------------|-------------|-----------------|----------|
| Temperature | 10-35°C | active | location, unit, calibration |
| Door | 0 (closed) / 1 (open) | open, closed | entrance, door_type, access_level |
| Card | 8-digit numbers | read_success | scanner location, card_type, encryption |
| Humidity | 0-100% | normal, high_humidity | zone, unit, sensor_model |
| Motion | 0 (no motion) / 1 (detected) | motion_detected, no_motion | corridor, range, sensitivity |
| Smoke | 0-10 ppm | safe, alert | fire_zone, unit, alarm_threshold |

### Simulation Commands

```bash
# Basic simulation with enhanced metadata (default)
npm run simulate

# Verbose output with detailed logs
npm run simulate:verbose

# Disable enhanced metadata for backward compatibility
npm run simulate:basic

# Custom parameters
node simulate_iot.js --iterations=100 --delay=1000 --verbose

# Disable enhanced metadata
node simulate_iot.js --iterations=50 --no-enrich-metadata
```

## Enhanced Metadata Features (Step 6)

The simulation includes enriched device metadata for advanced dashboard and AI analysis:

### Enhanced Device Information
- **device_name**: Human-friendly names (e.g., "Temperature Sensor 001")
- **location**: Realistic room/zone identifiers from predefined pools
- **battery_level**: Current battery charge percentage (0-100%)
- **last_calibration**: Recent calibration date (within past 12 months)
- **manufacturer**: Random manufacturer from: Acme Sensors, IoTCo, TechDevices, SmartSensor Inc, ConnectedTech
- **system_health**: Health status based on battery level and sensor readings
  - `good`: Battery > 40%, normal sensor readings
  - `warning`: Battery 20-40% or abnormal sensor readings
  - `critical`: Battery < 20% or dangerous sensor readings

### Device Registry System
- Maintains consistent metadata for each device across simulation runs
- Simulates realistic battery degradation over time
- Caches device information for performance

### Enhanced Analysis
- Battery status monitoring with low-battery alerts
- System health distribution analysis
- Manufacturer distribution tracking
- Advanced metadata validation

## Analytics & Health Monitoring (Step 7)

The project now includes automated analytics and health monitoring capabilities:

### Automated Summary Tables
- **sensor_stats**: Aggregated statistics per sensor type (event counts, min/max/avg values)
- **device_health**: Per-device health metrics and status monitoring
- **Auto-updating**: PostgreSQL triggers automatically maintain summary data

### Analytics Script
Comprehensive analytics generation with `analyze_data.js`:

```bash
# Generate console analytics report
node analyze_data.js

# Export to JSON file with verbose output
node analyze_data.js --format=json --report-file=report.json --verbose

# Export to Markdown report
node analyze_data.js --format=markdown --report-file=report.md

# Show only critical health alerts
node analyze_data.js --health-alerts
```

### Analytics Features
- **System Summary**: Total devices, events, average battery levels
- **Health Monitoring**: Device status distribution (good/warning/critical)
- **Sensor Statistics**: Real-time aggregated metrics per sensor type
- **Health Alerts**: Critical and warning device notifications
- **Trend Analysis**: Daily event patterns, manufacturer distribution
- **Multiple Formats**: Console, JSON, and Markdown output

### Configuration Options
```bash
# Enhanced metadata simulation (default)
node simulate_iot.js --enrich-metadata

# Disable enhanced metadata for basic simulation
node simulate_iot.js --no-enrich-metadata

# Combined with other options
node simulate_iot.js --iterations=20 --delay=500 --verbose --enrich-metadata
```

## Environment Configuration

The project includes a `.env.example` template for environment variables:

```bash
# Supabase Configuration
# Copy this file to .env and fill in your actual values
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anonymous-api-key-here
```

To configure your environment:
1. Copy `.env.example` to `.env`
2. Replace the placeholder values with your actual Supabase credentials
3. Ensure `.env` is in your `.gitignore` to keep credentials secure

## Project Structure

```
IOT-Dashboards/
├── simulate_iot.js         # Enhanced IoT data simulation script
├── simulate_iot_enhanced.js # Alternative enhanced version (reference)
├── package.json            # Node.js dependencies and scripts
├── .env.example           # Environment variables template
├── docs/
│   └── APIDocs.MD          # Complete API reference
├── .github/
│   ├── instructions/       # Development guidelines
│   └── prompts/           # Step-by-step setup guides
├── supabase_token.txt     # Supabase access token (gitignored)
├── .gitignore
└── README.md
```

## Database Schema

### `iot_events` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Auto-incrementing primary key |
| `device_id` | text | Unique device identifier |
| `type` | text | Sensor type (temperature, door, card, humidity, motion, smoke) |
| `value` | numeric | Sensor reading value |
| `status` | text | Device status |
| `metadata` | jsonb | Additional structured data |
| `created_at` | timestamptz | Timestamp of record creation |

### `sensor_stats` Table (Step 7)

| Column | Type | Description |
|--------|------|-------------|
| `type` | text | Sensor type (primary key) |
| `event_count` | bigint | Total number of events for this sensor type |
| `min_value` | numeric | Minimum recorded value |
| `max_value` | numeric | Maximum recorded value |
| `avg_value` | numeric | Average value |
| `last_updated` | timestamptz | Last update timestamp |

### `device_health` Table (Step 7)

| Column | Type | Description |
|--------|------|-------------|
| `device_id` | text | Unique device identifier (primary key) |
| `latest_battery_level` | numeric | Current battery percentage |
| `last_calibration` | timestamptz | Most recent calibration date |
| `manufacturer` | text | Device manufacturer |
| `health_status` | text | Health status ('good', 'warning', 'critical') |
| `last_updated` | timestamptz | Last update timestamp |

### Automated Updates
- **Triggers**: PostgreSQL triggers automatically update summary tables on new events
- **Functions**: `update_sensor_stats()` and `update_device_health()` maintain data integrity
- **Real-time**: Summary data reflects live sensor readings

## Getting Started

1. **Set up Supabase Project**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Run the database migrations to create the `iot_events` table

2. **Configure Environment**
   - Add your Supabase credentials to environment variables
   - Set up Row Level Security policies as needed

3. **API Usage**
   - Refer to `docs/APIDocs.MD` for complete API documentation
   - Use the REST API endpoints to insert and query sensor data

## API Quick Start

### Insert Sensor Data

```javascript
const { data, error } = await supabase
  .from('iot_events')
  .insert([
    {
      device_id: 'sensor_001',
      type: 'temperature',
      value: 23.5,
      status: 'active',
      metadata: { location: 'living_room', unit: 'celsius' }
    }
  ])
```

### Query Recent Data

```javascript
const { data, error } = await supabase
  .from('iot_events')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10)
```

## Documentation

- [Complete API Reference](docs/APIDocs.MD)
- [Setup Instructions](.github/instructions/plan.instructions.md)

## Contributing

This project follows structured development guidelines. Please refer to the instructions in `.github/instructions/` for development standards and procedures.

## License

This project is open source and available under the [MIT License](LICENSE).
