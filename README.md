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

- **Real-time Data Collection**: Live sensor data ingestion via REST API
- **Supabase Backend**: Robust PostgreSQL database with Row Level Security
- **API Documentation**: Comprehensive API reference for all operations
- **Flexible Schema**: JSONB metadata support for extensible device information
- **Real-time Subscriptions**: WebSocket support for live data updates

## Project Structure

```
IOT-Dashboards/
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
