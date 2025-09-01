---
mode: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.

## Objective
Review and validate the **8 core tables** of the IoT Dashboard (`iot_events`, `devices`, `device_types`, `locations`, `manufacturers`, `sensor_stats`, `device_health`, `_ops_device_id_renames`). Ensure schema consistency, clean design, and proper relationships. Keep it simple and production-ready.

## Context (observations)
- `devices` table has proper FKs to `device_types`, `locations`, `manufacturers`.  
- `iot_events.device_id` is **text only** (no FK) → potential cause of “Unknown” devices.  
- `_ops_device_id_renames` is a **temporary utility table** → may be cleaned up.  
- Analytics tables (`sensor_stats`, `device_health`) depend on triggers and should align with event/device data.

## Tasks
1. Verify all 8 tables exist and match the intended relationships.  
2. Ensure **referential integrity**: ideally `iot_events.device_id` → `devices.device_id`.  
3. Flag or fix inconsistencies (e.g., unknown manufacturers, orphan devices).  
4. Remove or archive `_ops_device_id_renames` if no longer needed.  
5. Save validation summary + updated ER diagram into `_reports/`.  

## Deliverables
- ✅ Clean schema with consistent relationships  
- ✅ Report: `_reports/schema_validation.md` (human-readable summary)  
- ✅ JSON: `_reports/schema_validation.json` (machine-validated)  

## Success Criteria
- All 8 tables match perfectly  
- No “Unknown” or orphan devices remain  Manufacturer Distribution:
  Acme Sensors: 23 devices
  SmartSensor Inc: 18 devices
  IoTCo Manufacturing: 9 devices
  TechDevices Corp: 3 devices
  TechDevices: 5 devices
  IoTCo: 6 devices
  ConnectedTech: 7 devices
  Unknown: 12 devices
- Schema is clean, simple, and makes sense end-to-end  
