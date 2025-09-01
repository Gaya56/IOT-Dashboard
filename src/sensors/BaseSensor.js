// Base sensor class for IoT device simulation
// Provides common functionality for all sensor types

class BaseSensor {
    constructor(device) {
        this.device = device;
        this.deviceId = device.device_id;
        this.deviceName = device.device_name || `${device.type_name}_${this.deviceId}`;
        this.location = device.location_name || 'Unknown Location';
        this.manufacturer = device.manufacturer_name || 'Unknown Manufacturer';
        this.batteryLevel = device.battery_level || 100;
        this.sensorRange = device.sensor_range;
        this.unit = device.unit;
        this.metadata = device.metadata || {};
    }

    // Generate base metadata that all sensors should have
    generateBaseMetadata() {
        return {
            location: this.location,
            device_name: this.deviceName,
            manufacturer: this.manufacturer,
            battery_level: this.batteryLevel,
            last_calibration: this.getLastCalibrationDate(),
            system_health: this.calculateSystemHealth()
        };
    }

    // Calculate system health based on battery and readings
    calculateSystemHealth() {
        if (this.batteryLevel < 20) {
            return 'critical';
        } else if (this.batteryLevel < 40) {
            return 'warning';
        }
        return 'good';
    }

    // Generate a realistic last calibration date
    getLastCalibrationDate() {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 365); // Random date within last year
        const calibrationDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        return calibrationDate.toISOString().split('T')[0];
    }

    // Simulate battery degradation over time
    degradeBattery() {
        const degradationRate = Math.random() * 0.5; // 0-0.5% per reading
        this.batteryLevel = Math.max(0, this.batteryLevel - degradationRate);
        return this.batteryLevel;
    }

    // Check if sensor reading is within normal range (for anomaly detection)
    isAnomalous(value, normalRange) {
        const [min, max] = normalRange;
        return value < min || value > max;
    }

    // Generate anomaly pattern event
    generatePatternEvent(patternType, description, confidence, severity = 'medium', metadata = {}) {
        return {
            device_id: this.deviceId,
            pattern_type: patternType,
            pattern_description: description,
            confidence_score: confidence,
            severity: severity,
            metadata: {
                ...metadata,
                detected_value: metadata.value,
                device_type: this.device.type_name,
                location: this.location
            }
        };
    }

    // Abstract method - must be implemented by each sensor type
    generateReading() {
        throw new Error('generateReading() must be implemented by sensor subclass');
    }

    // Abstract method - must be implemented by each sensor type
    getStatus() {
        throw new Error('getStatus() must be implemented by sensor subclass');
    }
}

module.exports = BaseSensor;