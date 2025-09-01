# 🏗️ Supabase Architecture & Workflow Visual

## 📊 **System Overview**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    IoT Dashboard Ecosystem                         │
│                                                                     │
│  📱 Simulators          🗄️  Supabase Database        📊 Analytics   │
│  ┌─────────────┐       ┌─────────────────────┐     ┌─────────────┐  │
│  │simulate_iot │ ────► │     iot_events      │ ◄── │ analyze_data│  │
│  │     .js     │       │   (primary data)    │     │    .js      │  │
│  └─────────────┘       └─────────────────────┘     └─────────────┘  │
│                                  │                                   │
│  ┌─────────────┐                 │ triggers                         │
│  │ simulate_   │                 ▼                                   │
│  │manufacturing│       ┌─────────────────────┐                     │
│  │    .js      │ ────► │   sensor_stats      │                     │
│  └─────────────┘       │   device_health     │                     │
│                        │  (auto-updated)     │                     │
│                        └─────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 **Data Flow Architecture**

```
IoT Sensors → Node.js Simulators → Supabase REST API → PostgreSQL → Analytics
     │              │                     │                │           │
     ▼              ▼                     ▼                ▼           ▼
  Real Data    Generated Data        HTTP POST        Triggers    Reports
     │              │                     │                │           │
     └──────────────┴─────────────────────┴────────────────┴───────────┘
                            Unified Processing Pipeline
```

## 🗄️ **Database Table Relationships**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   iot_events    │    │  sensor_stats   │    │  device_health  │
│                 │    │                 │    │                 │
│ • device_id     │───▶│ • type          │    │ • device_id     │
│ • type          │    │ • event_count   │    │ • battery_level │
│ • value         │    │ • min_value     │    │ • health_status │
│ • metadata      │    │ • max_value     │    │ • last_updated  │
│ • created_at    │    │ • avg_value     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       ▲                       ▲
         │                       │                       │
         └───────── PostgreSQL Triggers ─────────────────┘
                    (Auto-update on insert)

┌─────────────────────────────────────────────────────────────────────┐
│                    Manufacturing Registry (Step 9)                 │
│                                                                     │
│ ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌───────────┐ │
│ │   devices   │──▶│device_types │   │maintenance_ │   │pattern_   │ │
│ │             │   │             │   │  records    │   │ events    │ │
│ │ • device_id │   │ • type_name │   │ • device_id │   │ • device_ │ │
│ │ • location  │   │ • sensor_   │   │ • maintenance│   │   id      │ │
│ │ • manufac-  │   │   range     │   │   _date     │   │ • pattern │ │
│ │   turer     │   │ • unit      │   │ • cost      │   │   _type   │ │
│ └─────────────┘   └─────────────┘   └─────────────┘   └───────────┘ │
│        │                 ▲                 ▲                 ▲      │
│        └─────────────────┴─────────────────┴─────────────────┘      │
│                      Foreign Key Relationships                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 **Supabase Integration Workflow**

### 1. **Authentication & Connection**
```bash
Environment Variables:
├── SUPABASE_URL=https://itvndvydvyckxmdorxpd.supabase.co
└── SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 2. **REST API Operations**
```http
POST /rest/v1/iot_events
Headers:
├── apikey: [SUPABASE_ANON_KEY]
├── Authorization: Bearer [SUPABASE_ANON_KEY]
├── Content-Type: application/json
└── Prefer: return=representation

Body:
{
  "device_id": "device_temp_001",
  "type": "temperature", 
  "value": 23.5,
  "status": "active",
  "metadata": {
    "location": "Warehouse A",
    "battery_level": 85,
    "manufacturer": "Acme Sensors"
  }
}
```

### 3. **Auto-Processing Pipeline**
```sql
-- Triggered on INSERT to iot_events
┌─ INSERT event ────────────────────┐
│                                   │
▼                                   ▼
update_sensor_stats()    update_device_health()
│                                   │
▼                                   ▼
sensor_stats table      device_health table
(aggregated data)       (health monitoring)
```

## 📊 **Real-time Monitoring Dashboard**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    System Health Overview                          │
├─────────────────────────────────────────────────────────────────────┤
│ 📊 Total Events: 124+        🔋 Avg Battery: 56.4%                │
│ 🏭 Devices: 78 active        ⚠️  Warnings: 6 devices             │
│ 📈 Success Rate: 90%         🚨 Critical: 5 devices               │
├─────────────────────────────────────────────────────────────────────┤
│                      Sensor Type Distribution                      │
│ Temperature ████████████████████████████ 28 events                 │
│ Door        ████████████████████████ 21 events                     │
│ Motion      ████████████████████ 18 events                         │
│ Card        ████████████████████ 18 events                         │
│ Humidity    ████████████████ 16 events                             │
│ Smoke       ███████ 7 events                                       │
│ Gas         █████ 5 events                                         │
│ Vibration   ████ 4 events                                          │
├─────────────────────────────────────────────────────────────────────┤
│                        Recent Alerts                               │
│ ⚠️  device_810283: Low battery (10.3%)                            │
│ 🚨 device_372058: Critical health status                           │
│ ⚠️  device_408823: Low battery (12%)                              │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎯 **Production Deployment Architecture**

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Production Setup                            │
│                                                                     │
│ ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐   │
│ │   Node.js   │    │  Supabase   │    │      Monitoring         │   │
│ │             │    │             │    │                         │   │
│ │ Simulators  │───▶│ PostgreSQL  │───▶│ • Health Alerts         │   │
│ │ • Standard  │    │ • RLS       │    │ • Battery Monitoring    │   │  
│ │ • Manufact. │    │ • Triggers  │    │ • Pattern Detection     │   │
│ │ • Analytics │    │ • REST API  │    │ • Maintenance Tracking  │   │
│ └─────────────┘    └─────────────┘    └─────────────────────────┘   │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                    Scalability Features                        │ │
│ │ • Auto-scaling with Supabase infrastructure                    │ │
│ │ • Database connection pooling                                  │ │
│ │ • Trigger-based real-time processing                          │ │
│ │ • JSONB for flexible metadata storage                         │ │
│ │ • Row Level Security for multi-tenant support                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## ⚡ **Performance Metrics**

| **Metric** | **Standard Simulation** | **Manufacturing Simulation** |
|------------|------------------------|------------------------------|
| **Throughput** | 20+ events/second | 15+ events/second |
| **Success Rate** | 100% | 90% |
| **Response Time** | <50ms average | <100ms average |
| **Data Types** | 6 sensor types | 8 sensor types |
| **Features** | Basic metadata | Full device registry |

## 🔐 **Security Architecture**

```
Authentication Flow:
┌─ Client Request ──┐
│                   │
▼                   ▼
API Key         Bearer Token
    │               │
    └─── Supabase ──┘
         │
         ▼
    Row Level Security
         │
         ▼
    PostgreSQL Database
```

**Security Features:**
- ✅ API key authentication
- ✅ Row Level Security (RLS) policies
- ✅ Data validation constraints
- ✅ Secure environment variable management

---

**🎉 Status: Production-ready IoT system with comprehensive monitoring, real-time processing, and scalable architecture.**
