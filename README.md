# IoT Dashboard

A real-time IoT monitoring dashboard built with Supabase backend for collecting and visualizing sensor data from various IoT devices in manufacturing environments.

## Overview

This project provides a comprehensive IoT data collection and monitoring system optimized for manufacturing environments. It supports **9 sensor types** with enhanced simulation, database optimization, and real-time analytics.

### Supported Sensors

- **Temperature sensors** - Environmental monitoring (-32°C to 33°C)
- **Door sensors** - Access control and security
- **Card readers** - Employee access tracking  
- **Humidity sensors** - Environmental control (20-97%)
- **Motion detectors** - Movement and security monitoring
- **Smoke detectors** - Fire safety (1.2-9.1 ppm)
- **Vibration monitors** - Equipment health (0.1-3.6g)
- **Gas detectors** - Air quality safety (18-95 ppm)

## Features

- **🏭 Manufacturing Simulation**: Realistic IoT sensor data generation with 100% reliability
- **📊 Real-time Analytics**: Automated health monitoring and trend analysis
- **🔧 Database Optimization**: Perfect referential integrity with foreign key constraints
- **📋 Device Registry**: 83+ devices across 7 manufacturers with battery tracking
- **🔍 Pattern Detection**: Anomaly detection for predictive maintenance
- **📈 Health Monitoring**: Critical/warning/good status classification
- **🚀 High Performance**: Processes 270+ events with excellent data quality

## Quick Start

### Prerequisites

- Node.js (v20 or higher) 
- npm package manager
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

### Available Commands

#### Manufacturing Simulation

```bash
# Quick test (10 iterations, 200ms delay)
npm run manufacturing:quick

# Standard manufacturing simulation
npm run manufacturing

# Verbose output with detailed logging
npm run manufacturing:verbose  

# Extended run (100 iterations, 1s delay)
npm run manufacturing:long

# Device-specific simulations
npm run manufacturing:temperature
npm run manufacturing:vibration
npm run manufacturing:gas
```

#### Analytics & Reporting

```bash
# Generate analytics report (console output)
npm run analytics

# Verbose analytics with detailed device health
npm run analytics:verbose

# Export analytics to JSON file
npm run analytics:json

# Export analytics to Markdown
npm run analytics:markdown
```

#### Legacy Simulation (Basic)

```bash
# Basic IoT simulation
npm run simulate

# Verbose simulation logging
npm run simulate:verbose

# Basic simulation without metadata enrichment
npm run simulate:basic
```

|


## Documentation & Reports

### 📚 Documentation

- **[Repository Overview](docs/repository-overview.md)** - Complete project structure and features
- **[Supabase Architecture](docs/supabase-workflow.md)** - Database schema and workflow diagrams  
- **[API Documentation](docs/APIDocs.MD)** - REST API reference and examples
- **[Architecture Guide](docs/architecture.md)** - Technical architecture details

### 📊 System Reports

- **[Reports Navigation](_reports/index.md)** - Quick access to all reports
- **[System Status](_reports/current/system-status.md)** - Current production metrics (302+ events)
- **[Database Schema](_reports/current/database-schema.md)** - Optimized 7-table structure  
- **[Testing Results](_reports/testing/)** - Comprehensive validation reports

### 🔧 Development

- **[Setup Instructions](.github/instructions/plan.instructions.md)** - Development guidelines
- **[Database Optimization](.github/prompts/)** - Step-by-step optimization workflows

---

**Current Status**: ✅ **Production Ready** - 100% pipeline success rate, A+ data quality, perfect referential integrity

## Contributing

This project follows structured development guidelines. Please refer to the instructions in `.github/instructions/` for development standards and procedures.

## License

This project is open source and available under the [MIT License](LICENSE).
