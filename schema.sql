-- Step 9: Manufacturing Database Enhancement Schema
-- Based on research from PostgreSQL best practices and Supabase documentation
-- References:
-- - PostgreSQL naming conventions: https://stackoverflow.com/questions/2878248/postgresql-naming-conventions
-- - Industrial IoT sensors: https://www.machinemetrics.com/connectivity/hardware/iiot-sensors
-- - Supabase RLS best practices: https://supabase.com/docs/guides/database/postgres/row-level-security

-- 1. Device Types Table
-- Stores the different types of IoT sensors available in the manufacturing facility
CREATE TABLE IF NOT EXISTS device_types (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    type_name TEXT NOT NULL UNIQUE, -- e.g., 'temperature', 'vibration', 'pressure'
    display_name TEXT NOT NULL, -- e.g., 'Temperature Sensor', 'Vibration Monitor'
    description TEXT,
    sensor_range TEXT, -- e.g., '-40°C to +80°C', '0-10g amplitude'
    unit TEXT, -- e.g., 'celsius', 'ppm', 'g'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on device_types
ALTER TABLE device_types ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for anon role (needed for simulation)
CREATE POLICY "Allow all operations for anon" ON device_types 
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- 2. Manufacturers Table
-- Stores information about device manufacturers
CREATE TABLE IF NOT EXISTS manufacturers (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    contact_info JSONB, -- email, phone, address as JSON
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on manufacturers
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for anon role
CREATE POLICY "Allow all operations for anon" ON manufacturers 
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- 3. Locations Table
-- Stores facility locations and zones where devices are installed
CREATE TABLE IF NOT EXISTS locations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE, -- e.g., 'Warehouse A - Zone 1', 'Production Line 2'
    description TEXT,
    facility_type TEXT, -- e.g., 'warehouse', 'production_line', 'office'
    coordinates POINT, -- optional GPS coordinates
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for anon role
CREATE POLICY "Allow all operations for anon" ON locations 
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- 4. Devices Table (Core Registry)
-- Central registry of all IoT devices in the facility
CREATE TABLE IF NOT EXISTS devices (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    device_name TEXT NOT NULL, -- human-friendly name
    device_id TEXT NOT NULL UNIQUE, -- matches device_id in iot_events
    device_type_id BIGINT NOT NULL REFERENCES device_types(id) ON DELETE RESTRICT,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    manufacturer_id BIGINT NOT NULL REFERENCES manufacturers(id) ON DELETE RESTRICT,
    installation_date DATE DEFAULT CURRENT_DATE,
    battery_capacity NUMERIC, -- in mAh
    battery_level NUMERIC CHECK (battery_level >= 0 AND battery_level <= 100), -- percentage
    last_calibration_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'offline', 'decommissioned')),
    metadata JSONB, -- additional device-specific information
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on devices
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for anon role
CREATE POLICY "Allow all operations for anon" ON devices 
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Create indexes for foreign keys (performance optimization based on research)
CREATE INDEX IF NOT EXISTS idx_devices_device_type_id ON devices(device_type_id);
CREATE INDEX IF NOT EXISTS idx_devices_location_id ON devices(location_id);
CREATE INDEX IF NOT EXISTS idx_devices_manufacturer_id ON devices(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);

-- 5. Maintenance Records Table
-- Tracks maintenance history for each device
CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    maintenance_date TIMESTAMPTZ DEFAULT NOW(),
    maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('calibration', 'repair', 'inspection', 'replacement', 'upgrade')),
    performed_by TEXT, -- technician name or ID
    notes TEXT,
    cost NUMERIC(10,2), -- maintenance cost
    next_maintenance_date DATE, -- scheduled next maintenance
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on maintenance_records
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for anon role
CREATE POLICY "Allow all operations for anon" ON maintenance_records 
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Create index for foreign key
CREATE INDEX IF NOT EXISTS idx_maintenance_records_device_id ON maintenance_records(device_id);

-- 6. Pattern Events Table (Anomaly Detection)
-- Based on research: stores detected patterns and anomalies for AI processing
CREATE TABLE IF NOT EXISTS pattern_events (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- e.g., 'vibration_anomaly', 'temperature_drift', 'gas_leak'
    pattern_description TEXT,
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1), -- 0-1 confidence
    severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    metadata JSONB, -- pattern-specific data like thresholds, measurements
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on pattern_events
ALTER TABLE pattern_events ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for anon role
CREATE POLICY "Allow all operations for anon" ON pattern_events 
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Create index for foreign key
CREATE INDEX IF NOT EXISTS idx_pattern_events_device_id ON pattern_events(device_id);
CREATE INDEX IF NOT EXISTS idx_pattern_events_detected_at ON pattern_events(detected_at);

-- SEED DATA

-- Insert device types (industrial IoT sensors based on research)
INSERT INTO device_types (type_name, display_name, description, sensor_range, unit) VALUES
('temperature', 'Temperature Sensor', 'Monitors ambient and equipment temperature', '-40°C to +80°C', 'celsius'),
('humidity', 'Humidity Sensor', 'Measures relative humidity levels', '0-100%', 'percent'),
('vibration', 'Vibration Monitor', 'Detects equipment wear and misalignment by measuring frequency, velocity and amplitude', '0-10g amplitude', 'g'),
('pressure', 'Pressure Sensor', 'Monitors pressure levels and proximity states', '0-100 PSI', 'psi'),
('gas', 'Gas Detector', 'Detects gas concentrations and air quality', '0-1000 ppm', 'ppm'),
('motion', 'Motion Detector', 'Detects movement and presence', 'Binary detection', 'boolean'),
('door', 'Door Monitor', 'Tracks door/access point status', 'Open/Closed state', 'boolean'),
('card', 'Card Reader', 'Access control card scanner', 'Card ID numbers', 'numeric')
ON CONFLICT (type_name) DO NOTHING;

-- Insert manufacturers
INSERT INTO manufacturers (name, contact_info, notes) VALUES
('Acme Sensors', '{"email": "support@acmesensors.com", "phone": "+1-555-0100"}', 'Reliable industrial sensor manufacturer'),
('IoTCo Manufacturing', '{"email": "sales@iotco.com", "phone": "+1-555-0200"}', 'Specializes in wireless IoT devices'),
('SmartSensor Inc', '{"email": "info@smartsensor.com", "phone": "+1-555-0300"}', 'Advanced sensor technology solutions'),
('TechDevices Corp', '{"email": "contact@techdevices.com", "phone": "+1-555-0400"}', 'Industrial monitoring equipment'),
('ConnectedTech Solutions', '{"email": "hello@connectedtech.com", "phone": "+1-555-0500"}', 'Connected device specialists')
ON CONFLICT (name) DO NOTHING;

-- Insert locations (manufacturing facility layout)
INSERT INTO locations (name, description, facility_type) VALUES
('Warehouse A - Zone 1', 'Main storage area, temperature controlled', 'warehouse'),
('Warehouse A - Zone 2', 'Secondary storage, ambient temperature', 'warehouse'),
('Production Line 1', 'Primary manufacturing line', 'production_line'),
('Production Line 2', 'Secondary manufacturing line', 'production_line'),
('Quality Control Lab', 'Testing and inspection area', 'laboratory'),
('Equipment Room', 'Machinery and equipment storage', 'utility'),
('Loading Dock', 'Shipping and receiving area', 'logistics'),
('Office Area', 'Administrative offices', 'office'),
('Server Room', 'IT infrastructure and networking', 'technical'),
('Maintenance Workshop', 'Repair and maintenance area', 'workshop')
ON CONFLICT (name) DO NOTHING;

-- Insert sample devices (will be used by enhanced simulation)
INSERT INTO devices (device_name, device_id, device_type_id, location_id, manufacturer_id, battery_capacity, battery_level, last_calibration_date, metadata) VALUES
('Temperature Sensor A1', 'device_temp_001', 1, 1, 1, 5000, 85, '2024-01-15', '{"accuracy": "±0.5°C", "model": "TS-100"}'),
('Temperature Sensor A2', 'device_temp_002', 1, 2, 2, 5000, 72, '2024-02-10', '{"accuracy": "±0.5°C", "model": "TS-200"}'),
('Humidity Monitor B1', 'device_hum_001', 2, 1, 3, 4000, 90, '2024-01-20', '{"accuracy": "±2%", "model": "HM-50"}'),
('Vibration Monitor C1', 'device_vib_001', 3, 3, 4, 6000, 65, '2024-03-01', '{"frequency_range": "10-1000Hz", "model": "VM-300"}'),
('Vibration Monitor C2', 'device_vib_002', 3, 4, 5, 6000, 45, '2024-02-28', '{"frequency_range": "10-1000Hz", "model": "VM-400"}'),
('Pressure Sensor D1', 'device_press_001', 4, 3, 1, 3500, 78, '2024-01-25', '{"range": "0-100PSI", "model": "PS-75"}'),
('Gas Detector E1', 'device_gas_001', 5, 6, 2, 8000, 55, '2024-02-15', '{"gases": ["CO", "CO2", "CH4"], "model": "GD-500"}'),
('Motion Detector F1', 'device_motion_001', 6, 7, 3, 2000, 88, '2024-01-30', '{"range": "12m", "model": "MD-200"}'),
('Door Monitor G1', 'device_door_001', 7, 7, 4, 1500, 92, '2024-02-05', '{"type": "magnetic_reed", "model": "DM-100"}'),
('Card Reader H1', 'device_card_001', 8, 8, 5, 3000, 75, '2024-01-18', '{"encryption": "AES-256", "model": "CR-150"})
ON CONFLICT (device_id) DO NOTHING;

-- Insert sample maintenance records
INSERT INTO maintenance_records (device_id, maintenance_type, performed_by, notes, cost) VALUES
(1, 'calibration', 'Tech-001', 'Routine calibration completed', 50.00),
(2, 'inspection', 'Tech-002', 'Visual inspection and cleaning', 25.00),
(4, 'repair', 'Tech-001', 'Replaced faulty vibration sensor component', 150.00),
(7, 'calibration', 'Tech-003', 'Gas detector calibration with test gases', 75.00);

-- Insert sample pattern events (anomaly detection examples)
INSERT INTO pattern_events (device_id, pattern_type, pattern_description, confidence_score, severity, metadata) VALUES
(4, 'vibration_anomaly', 'Unusual vibration pattern detected on production line 1', 0.85, 'medium', '{"threshold_exceeded": 8.5, "normal_range": "0-6g"}'),
(2, 'temperature_drift', 'Gradual temperature increase over 24 hours', 0.72, 'low', '{"drift_rate": "0.5°C/hour", "expected": "22°C"}'),
(7, 'gas_leak', 'CO concentration above safety threshold', 0.95, 'critical', '{"measured_ppm": 850, "threshold_ppm": 500}'),
(1, 'sensor_failure', 'Temperature sensor reading inconsistencies', 0.68, 'medium', '{"variance": "high", "last_calibration": "2024-01-15"});

-- Update sensor_stats table to include new sensor types
INSERT INTO sensor_stats (type, event_count, min_value, max_value, avg_value) VALUES
('vibration', 0, NULL, NULL, NULL),
('pressure', 0, NULL, NULL, NULL),
('gas', 0, NULL, NULL, NULL)
ON CONFLICT (type) DO NOTHING;

-- Create a view for easy device overview (joins all related data)
CREATE OR REPLACE VIEW device_overview AS
SELECT 
    d.id,
    d.device_name,
    d.device_id,
    dt.display_name as device_type,
    dt.type_name,
    l.name as location_name,
    l.facility_type,
    m.name as manufacturer_name,
    d.battery_level,
    d.status,
    d.last_calibration_date,
    d.installation_date,
    CASE 
        WHEN d.battery_level < 20 THEN 'critical'
        WHEN d.battery_level < 40 THEN 'warning' 
        ELSE 'good'
    END as battery_status,
    d.created_at
FROM devices d
JOIN device_types dt ON d.device_type_id = dt.id
JOIN locations l ON d.location_id = l.id  
JOIN manufacturers m ON d.manufacturer_id = m.id;

-- Create a function to get random device for simulation
CREATE OR REPLACE FUNCTION get_random_device()
RETURNS TABLE(
    device_id TEXT,
    type_name TEXT,
    device_name TEXT,
    location_name TEXT,
    manufacturer_name TEXT,
    battery_level NUMERIC,
    sensor_range TEXT,
    unit TEXT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        d.device_id,
        dt.type_name,
        d.device_name,
        l.name as location_name,
        m.name as manufacturer_name,
        d.battery_level,
        dt.sensor_range,
        dt.unit
    FROM devices d
    JOIN device_types dt ON d.device_type_id = dt.id
    JOIN locations l ON d.location_id = l.id
    JOIN manufacturers m ON d.manufacturer_id = m.id
    WHERE d.status = 'active'
    ORDER BY RANDOM()
    LIMIT 1;
$$;

-- Update existing triggers to handle new sensor types
-- The existing triggers should automatically handle the new types as they're not type-specific

COMMENT ON TABLE device_types IS 'Types of IoT sensors available in the manufacturing facility';
COMMENT ON TABLE manufacturers IS 'Device manufacturers and their contact information';  
COMMENT ON TABLE locations IS 'Facility locations and zones where devices are installed';
COMMENT ON TABLE devices IS 'Central registry of all IoT devices with their relationships';
COMMENT ON TABLE maintenance_records IS 'Historical maintenance and service records for devices';
COMMENT ON TABLE pattern_events IS 'Detected patterns and anomalies for AI processing';
COMMENT ON VIEW device_overview IS 'Comprehensive view of devices with all related information';