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
# Basic simulation
npm run simulate

# Verbose output with detailed logs
npm run simulate:verbose

# Custom parameters
node simulate_iot.js --iterations=100 --delay=1000 --verbose
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
├── simulate_iot.js         # Node.js IoT data simulation script
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
