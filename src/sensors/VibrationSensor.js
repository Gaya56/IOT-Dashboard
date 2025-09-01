// Vibration sensor simulation module
// Monitors equipment wear and misalignment through frequency, velocity and amplitude measurements

const BaseSensor = require('./BaseSensor');

class VibrationSensor extends BaseSensor {
    constructor(device) {
        super(device);
        this.maxAmplitude = this.parseAmplitudeRange();
        this.baselineAmplitude = this.maxAmplitude * 0.3; // Normal operating amplitude
        this.lastReading = null;
        this.equipmentState = 'normal'; // normal, wearing, misaligned
    }

    // Parse amplitude range from device configuration
    parseAmplitudeRange() {
        if (this.sensorRange && this.sensorRange.includes('g')) {
            const match = this.sensorRange.match(/(\d+(?:\.\d+)?)/);
            if (match) {
                return parseFloat(match[1]);
            }
        }
        return 10; // Default max amplitude in g
    }

    // Generate realistic vibration reading
    generateReading() {
        let amplitude = this.baselineAmplitude;
        
        // Simulate different equipment states
        switch (this.equipmentState) {
            case 'wearing':
                amplitude *= (1 + Math.random() * 0.8); // 0-80% increase
                break;
            case 'misaligned':
                amplitude *= (1 + Math.random() * 1.2); // 0-120% increase
                break;
            default:
                amplitude *= (0.8 + Math.random() * 0.4); // ±20% variation
        }
        
        // Add random spikes (equipment issues)
        if (Math.random() < 0.05) { // 5% chance of spike
            amplitude *= (2 + Math.random() * 2); // 2-4x spike
            this.equipmentState = Math.random() > 0.5 ? 'wearing' : 'misaligned';
        }
        
        // Occasionally return to normal state
        if (Math.random() < 0.1 && this.equipmentState !== 'normal') {
            this.equipmentState = 'normal';
        }
        
        // Clamp to sensor range
        amplitude = Math.min(this.maxAmplitude, Math.max(0, amplitude));
        
        // Round to 2 decimal places
        amplitude = Math.round(amplitude * 100) / 100;
        
        this.lastReading = amplitude;
        return amplitude;
    }

    // Generate additional vibration metrics (frequency, velocity)
    generateVibrationMetrics(amplitude) {
        // Frequency typically correlates with amplitude
        const baseFrequency = 50; // Hz
        const frequency = baseFrequency + (amplitude / this.maxAmplitude) * 200; // 50-250 Hz range
        
        // Velocity also correlates with amplitude
        const velocity = amplitude * 10; // mm/s (rough correlation)
        
        return {
            amplitude: amplitude,
            frequency: Math.round(frequency * 10) / 10,
            velocity: Math.round(velocity * 100) / 100
        };
    }

    // Determine sensor status based on reading
    getStatus(reading = null) {
        const amplitude = reading || this.lastReading;
        if (amplitude === null) return 'unknown';
        
        const threshold70 = this.maxAmplitude * 0.7;
        const threshold90 = this.maxAmplitude * 0.9;
        
        if (amplitude > threshold90) {
            return 'critical';
        } else if (amplitude > threshold70) {
            return 'warning';
        } else if (amplitude > this.baselineAmplitude * 2) {
            return 'elevated';
        }
        return 'normal';
    }

    // Generate sensor-specific metadata
    generateSensorMetadata(reading) {
        const baseMetadata = this.generateBaseMetadata();
        const metrics = this.generateVibrationMetrics(reading);
        const status = this.getStatus(reading);
        
        return {
            ...baseMetadata,
            unit: this.unit || 'g',
            sensor_range: this.sensorRange || '0-10g amplitude',
            frequency_range: '10-1000Hz',
            equipment_state: this.equipmentState,
            vibration_metrics: metrics,
            status_details: {
                baseline_amplitude: this.baselineAmplitude,
                current_status: status,
                threshold_70: this.maxAmplitude * 0.7,
                threshold_90: this.maxAmplitude * 0.9
            }
        };
    }

    // Check for vibration anomalies and generate pattern events
    detectAnomalies(reading) {
        const patterns = [];
        const metrics = this.generateVibrationMetrics(reading);
        
        // High amplitude anomaly
        if (reading > this.maxAmplitude * 0.8) {
            patterns.push(this.generatePatternEvent(
                'vibration_anomaly',
                `High vibration amplitude detected: ${reading}g (max normal: ${this.baselineAmplitude * 1.5}g)`,
                0.9,
                reading > this.maxAmplitude * 0.9 ? 'critical' : 'high',
                { 
                    amplitude: reading, 
                    frequency: metrics.frequency,
                    velocity: metrics.velocity,
                    equipment_state: this.equipmentState,
                    threshold_exceeded: reading / (this.baselineAmplitude * 1.5)
                }
            ));
        }
        
        // Equipment wear detection
        if (this.equipmentState === 'wearing' && reading > this.baselineAmplitude * 1.8) {
            patterns.push(this.generatePatternEvent(
                'equipment_wear',
                `Equipment wear indicators: sustained elevated vibration ${reading}g`,
                0.8,
                'medium',
                { 
                    amplitude: reading,
                    wear_indicator: true,
                    baseline_multiplier: reading / this.baselineAmplitude
                }
            ));
        }
        
        // Misalignment detection
        if (this.equipmentState === 'misaligned' && metrics.frequency > 150) {
            patterns.push(this.generatePatternEvent(
                'equipment_misalignment',
                `Potential misalignment: high frequency ${metrics.frequency}Hz with amplitude ${reading}g`,
                0.85,
                'medium',
                { 
                    frequency: metrics.frequency,
                    amplitude: reading,
                    misalignment_indicator: true
                }
            ));
        }
        
        // Bearing failure early warning (very specific pattern)
        if (reading > this.baselineAmplitude * 3 && metrics.frequency > 200) {
            patterns.push(this.generatePatternEvent(
                'bearing_failure_warning',
                `Bearing failure indicators: extreme vibration ${reading}g at ${metrics.frequency}Hz`,
                0.9,
                'critical',
                { 
                    amplitude: reading,
                    frequency: metrics.frequency,
                    velocity: metrics.velocity,
                    failure_risk: 'high'
                }
            ));
        }
        
        return patterns;
    }

    // Generate complete sensor event data
    generateEvent() {
        const reading = this.generateReading();
        const status = this.getStatus(reading);
        const metadata = this.generateSensorMetadata(reading);
        
        // Degrade battery slightly (vibration sensors use more power)
        this.degradeBattery();
        
        return {
            device_id: this.deviceId,
            type: 'vibration',
            value: reading,
            status: status,
            metadata: metadata
        };
    }
}

module.exports = VibrationSensor;