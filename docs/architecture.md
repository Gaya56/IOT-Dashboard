# IoT Dashboard Architecture

## Overview
Real-time IoT monitoring system with Supabase PostgreSQL backend, Node.js simulation, and automated analytics.

## Core Files & Components

### Data Simulation
- **`simulate_iot.js`** - Main IoT sensor data generator
  - Simulates 6 sensor types (temperature, door, card, humidity, motion, smoke)
  - Generates realistic device metadata (battery, location, manufacturer)
  - Sends data to Supabase via REST API
  - Enhanced metadata with device registry system

### Analytics & Monitoring
- **`analyze_data.js`** - Comprehensive analytics script
  - Retrieves data from summary tables via Supabase REST API
  - Generates reports in console, JSON, and Markdown formats
  - Health monitoring with device status alerts
  - Trend analysis and system summaries

### Configuration
- **`.env`** - Environment variables (Supabase URL, API keys)
- **`package.json`** - Node.js dependencies and npm scripts

## Database Architecture (Supabase PostgreSQL)

### Core Data Table
- **`iot_events`** - Primary sensor data storage
  - Stores all IoT sensor readings with metadata
  - JSONB metadata for flexible device information
  - RLS enabled for security

### Summary Tables (Step 7 - Auto-updated via Triggers)
- **`sensor_stats`** - Aggregated statistics per sensor type
  - Event counts, min/max/average values
  - Automatically updated by PostgreSQL triggers
  
- **`device_health`** - Per-device health monitoring
  - Battery levels, calibration dates, health status
  - Health status calculated based on battery and sensor readings

### Automatic Updates
- **PostgreSQL Triggers** - Real-time summary table updates
- **`update_sensor_stats()`** - Function to maintain sensor statistics
- **`update_device_health()`** - Function to track device health metrics

## Workflow
1. **Data Generation**: `simulate_iot.js` creates realistic sensor data
2. **Data Ingestion**: REST API inserts data into `iot_events` table
3. **Auto-Processing**: Triggers update summary tables (`sensor_stats`, `device_health`)
4. **Analytics**: `analyze_data.js` queries summary tables for insights
5. **Reporting**: Multiple output formats (console, JSON, Markdown)

## Supabase Connection
- **REST API**: All data operations via Supabase REST endpoints
- **Authentication**: Anonymous key for public read/write access
- **Security**: Row Level Security (RLS) policies enabled
- **Real-time**: Summary tables reflect live sensor data

## Key Features
- Real-time data processing with PostgreSQL triggers
- Health monitoring with battery and status alerts
- Multi-format analytics reporting
- Backward compatibility maintained across updates