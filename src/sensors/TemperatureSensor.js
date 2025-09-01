// Temperature sensor simulation module
// Generates realistic temperature readings for industrial IoT monitoring

const BaseSensor = require('./BaseSensor');

class TemperatureSensor extends BaseSensor {
    constructor(device) {
        super(device);
        this.normalRange = this.parseTemperatureRange();
        this.lastReading = null;
        this.trendDirection = Math.random() > 0.5 ? 1 : -1; // Gradual temperature trend
    }

    // Parse temperature range from device configuration
    parseTemperatureRange() {
        if (this.sensorRange && this.sensorRange.includes('°C')) {
            const match = this.sensorRange.match(/-?\d+/g);
            if (match && match.length >= 2) {
                return [parseInt(match[0]), parseInt(match[1])];
            }
        }
        return [15, 35]; // Default industrial temperature range
    }

    // Generate realistic temperature reading
    generateReading() {
        const [minTemp, maxTemp] = this.normalRange;
        const baseTemp = minTemp + Math.random() * (maxTemp - minTemp);
        
        // Add small trend for realistic temperature drift
        const trendInfluence = Math.random() * 2 * this.trendDirection;
        let temperature = baseTemp + trendInfluence;
        
        // Occasionally reverse trend direction
        if (Math.random() < 0.1) {
            this.trendDirection *= -1;
        }
        
        // Add small random variations
        temperature += (Math.random() - 0.5) * 2;
        
        // Clamp to reasonable bounds
        temperature = Math.max(minTemp - 5, Math.min(maxTemp + 5, temperature));
        
        // Round to 1 decimal place
        temperature = Math.round(temperature * 10) / 10;
        
        this.lastReading = temperature;
        return temperature;
    }

    // Determine sensor status based on reading
    getStatus(reading = null) {
        const temp = reading || this.lastReading;
        if (temp === null) return 'unknown';
        
        const [minTemp, maxTemp] = this.normalRange;
        
        if (temp < minTemp - 10 || temp > maxTemp + 10) {
            return 'alarm';
        } else if (temp < minTemp - 5 || temp > maxTemp + 5) {
            return 'warning';
        }
        return 'active';
    }

    // Generate sensor-specific metadata
    generateSensorMetadata(reading) {
        const baseMetadata = this.generateBaseMetadata();
        const status = this.getStatus(reading);
        
        return {
            ...baseMetadata,
            unit: this.unit || 'celsius',
            sensor_range: this.sensorRange || '-40°C to +80°C',
            accuracy: '±0.5°C',
            calibration_date: this.getLastCalibrationDate(),
            status_details: {
                normal_range: `${this.normalRange[0]}°C to ${this.normalRange[1]}°C`,
                current_status: status
            }
        };
    }

    // Check for temperature anomalies and generate pattern events
    detectAnomalies(reading) {
        const patterns = [];
        const [minTemp, maxTemp] = this.normalRange;
        
        // Temperature drift detection
        if (this.lastReading && Math.abs(reading - this.lastReading) > 5) {
            patterns.push(this.generatePatternEvent(
                'temperature_spike',
                `Rapid temperature change detected: ${this.lastReading}°C to ${reading}°C`,
                0.8,
                'high',
                { previous_reading: this.lastReading, current_reading: reading, change_rate: reading - this.lastReading }
            ));
        }
        
        // Extreme temperature detection
        if (reading > maxTemp + 10) {
            patterns.push(this.generatePatternEvent(
                'temperature_overheat',
                `Critical high temperature: ${reading}°C (max: ${maxTemp}°C)`,
                0.95,
                'critical',
                { reading: reading, threshold: maxTemp, overage: reading - maxTemp }
            ));
        } else if (reading < minTemp - 10) {
            patterns.push(this.generatePatternEvent(
                'temperature_freeze',
                `Critical low temperature: ${reading}°C (min: ${minTemp}°C)`,
                0.95,
                'critical',
                { reading: reading, threshold: minTemp, underage: minTemp - reading }
            ));
        }
        
        // Gradual drift detection (comparing with expected range center)
        const expectedTemp = (minTemp + maxTemp) / 2;
        if (Math.abs(reading - expectedTemp) > (maxTemp - minTemp) * 0.8) {
            patterns.push(this.generatePatternEvent(
                'temperature_drift',
                `Temperature drift from normal range center: ${reading}°C vs expected ~${expectedTemp}°C`,
                0.7,
                'medium',
                { reading: reading, expected: expectedTemp, deviation: Math.abs(reading - expectedTemp) }
            ));
        }
        
        return patterns;
    }

    // Generate complete sensor event data
    generateEvent() {
        const reading = this.generateReading();
        const status = this.getStatus(reading);
        const metadata = this.generateSensorMetadata(reading);
        
        // Degrade battery slightly
        this.degradeBattery();
        
        return {
            device_id: this.deviceId,
            type: 'temperature',
            value: reading,
            status: status,
            metadata: metadata
        };
    }
}

module.exports = TemperatureSensor;