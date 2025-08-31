// Pre-request Script for IoT Sensor Data Generation
// This script generates realistic sensor data for 6 device types

// Array of sensor types
const sensorTypes = ['temperature', 'door', 'card', 'humidity', 'motion', 'smoke'];

// Randomly select a sensor type
const randomSensorIndex = Math.floor(Math.random() * sensorTypes.length);
const sensorType = sensorTypes[randomSensorIndex];

// Generate random device ID
const deviceId = `device_${Math.floor(Math.random() * 1000000)}`;

// Initialize variables
let sensorValue, deviceStatus, metadata;

// Generate realistic data based on sensor type
switch (sensorType) {
    case 'temperature':
        sensorValue = (Math.random() * 25 + 10).toFixed(1); // 10-35°C
        deviceStatus = 'active';
        metadata = {
            location: `room_${Math.floor(Math.random() * 20) + 1}`,
            unit: 'celsius',
            calibration_date: '2024-01-15'
        };
        break;
        
    case 'door':
        sensorValue = Math.random() > 0.5 ? 1 : 0; // 1 = open, 0 = closed
        deviceStatus = sensorValue === 1 ? 'open' : 'closed';
        metadata = {
            location: `entrance_${Math.floor(Math.random() * 10) + 1}`,
            door_type: 'main_entrance',
            access_level: 'public'
        };
        break;
        
    case 'card':
        sensorValue = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit card number
        deviceStatus = 'read_success';
        metadata = {
            location: `scanner_${Math.floor(Math.random() * 15) + 1}`,
            card_type: 'employee_id',
            encryption: 'AES256'
        };
        break;
        
    case 'humidity':
        sensorValue = (Math.random() * 100).toFixed(1); // 0-100%
        deviceStatus = sensorValue > 80 ? 'high_humidity' : 'normal';
        metadata = {
            location: `zone_${Math.floor(Math.random() * 25) + 1}`,
            unit: 'percentage',
            sensor_model: 'DHT22'
        };
        break;
        
    case 'motion':
        sensorValue = Math.random() > 0.7 ? 1 : 0; // 1 = motion, 0 = no motion
        deviceStatus = sensorValue === 1 ? 'motion_detected' : 'no_motion';
        metadata = {
            location: `corridor_${Math.floor(Math.random() * 12) + 1}`,
            detection_range: '5_meters',
            sensitivity: 'medium'
        };
        break;
        
    case 'smoke':
        sensorValue = (Math.random() * 10).toFixed(2); // 0-10 smoke density
        deviceStatus = sensorValue > 5 ? 'alert' : 'safe';
        metadata = {
            location: `fire_zone_${Math.floor(Math.random() * 8) + 1}`,
            unit: 'ppm',
            alarm_threshold: '5.0'
        };
        break;
}

// Set Postman variables
pm.variables.set('device_id', deviceId);
pm.variables.set('sensor_type', sensorType);
pm.variables.set('sensor_value', sensorValue);
pm.variables.set('device_status', deviceStatus);
pm.variables.set('sensor_metadata', JSON.stringify(metadata));

// Log for debugging
console.log(`Generated data:`, {
    device_id: deviceId,
    type: sensorType,
    value: sensorValue,
    status: deviceStatus,
    metadata: metadata
});
