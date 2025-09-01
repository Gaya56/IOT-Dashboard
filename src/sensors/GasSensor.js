// Gas detection sensor simulation module
// Monitors air quality and detects dangerous gas concentrations

const BaseSensor = require('./BaseSensor');

class GasSensor extends BaseSensor {
    constructor(device) {
        super(device);
        this.maxConcentration = this.parseConcentrationRange();
        this.safeThreshold = this.maxConcentration * 0.1; // 10% of max is safe
        this.warningThreshold = this.maxConcentration * 0.5; // 50% warning
        this.gasTypes = this.parseGasTypes();
        this.lastReading = null;
        this.leakState = 'normal'; // normal, minor_leak, major_leak
    }

    // Parse concentration range from device configuration
    parseConcentrationRange() {
        if (this.sensorRange && this.sensorRange.includes('ppm')) {
            const match = this.sensorRange.match(/(\d+)/);
            if (match) {
                return parseInt(match[1]);
            }
        }
        return 1000; // Default max concentration in ppm
    }

    // Parse supported gas types from metadata
    parseGasTypes() {
        if (this.metadata && this.metadata.gases) {
            return this.metadata.gases;
        }
        return ['CO', 'CO2', 'CH4']; // Default industrial gases
    }

    // Generate realistic gas concentration reading
    generateReading() {
        let concentration = 0;
        
        // Base ambient concentration (usually very low)
        concentration = Math.random() * this.safeThreshold * 0.5; // 0-5% of max
        
        // Simulate different leak states
        switch (this.leakState) {
            case 'minor_leak':
                concentration += Math.random() * this.warningThreshold * 0.3; // Add 0-15% more
                break;
            case 'major_leak':
                concentration += Math.random() * this.maxConcentration * 0.7; // Add 0-70% more
                break;
        }
        
        // Random leak events (2% chance)
        if (Math.random() < 0.02) {
            this.leakState = Math.random() > 0.3 ? 'minor_leak' : 'major_leak';
            concentration += Math.random() * this.warningThreshold;
        }
        
        // Recovery from leak state (10% chance to return to normal)
        if (Math.random() < 0.1 && this.leakState !== 'normal') {
            this.leakState = 'normal';
        }
        
        // Clamp to sensor range
        concentration = Math.min(this.maxConcentration, Math.max(0, concentration));
        
        // Round to 2 decimal places
        concentration = Math.round(concentration * 100) / 100;
        
        this.lastReading = concentration;
        return concentration;
    }

    // Determine sensor status based on reading
    getStatus(reading = null) {
        const concentration = reading || this.lastReading;
        if (concentration === null) return 'unknown';
        
        if (concentration > this.warningThreshold) {
            return 'alert';
        } else if (concentration > this.safeThreshold) {
            return 'warning';
        }
        return 'safe';
    }

    // Determine primary gas detected (for realism)
    getPrimaryGas(concentration) {
        // Different gases have different typical concentration patterns
        const gasWeights = {
            'CO': concentration > this.safeThreshold ? 0.4 : 0.2,  // More likely in leaks
            'CO2': 0.4, // Common in industrial settings
            'CH4': concentration > this.warningThreshold ? 0.6 : 0.3 // Very dangerous in high concentrations
        };
        
        // Select gas based on weighted random choice
        const totalWeight = Object.values(gasWeights).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (const [gas, weight] of Object.entries(gasWeights)) {
            random -= weight;
            if (random <= 0) {
                return gas;
            }
        }
        
        return this.gasTypes[0] || 'CO';
    }

    // Generate sensor-specific metadata
    generateSensorMetadata(reading) {
        const baseMetadata = this.generateBaseMetadata();
        const status = this.getStatus(reading);
        const primaryGas = this.getPrimaryGas(reading);
        
        return {
            ...baseMetadata,
            unit: this.unit || 'ppm',
            sensor_range: this.sensorRange || '0-1000 ppm',
            supported_gases: this.gasTypes,
            primary_gas_detected: primaryGas,
            leak_state: this.leakState,
            air_quality: this.getAirQualityIndex(reading),
            status_details: {
                safe_threshold: this.safeThreshold,
                warning_threshold: this.warningThreshold,
                current_status: status
            }
        };
    }

    // Calculate air quality index
    getAirQualityIndex(concentration) {
        const ratio = concentration / this.maxConcentration;
        if (ratio < 0.1) return 'excellent';
        if (ratio < 0.3) return 'good';
        if (ratio < 0.5) return 'moderate';
        if (ratio < 0.7) return 'poor';
        return 'hazardous';
    }

    // Check for gas anomalies and generate pattern events
    detectAnomalies(reading) {
        const patterns = [];
        const primaryGas = this.getPrimaryGas(reading);
        
        // Gas leak detection
        if (reading > this.warningThreshold) {
            patterns.push(this.generatePatternEvent(
                'gas_leak',
                `${primaryGas} concentration critical: ${reading}ppm (threshold: ${this.warningThreshold}ppm)`,
                0.95,
                'critical',
                { 
                    concentration: reading,
                    gas_type: primaryGas,
                    threshold: this.warningThreshold,
                    air_quality: this.getAirQualityIndex(reading),
                    leak_severity: this.leakState
                }
            ));
        }
        
        // Gradual buildup detection
        if (this.lastReading && reading > this.lastReading * 1.5 && reading > this.safeThreshold) {
            patterns.push(this.generatePatternEvent(
                'gas_buildup',
                `Rapid ${primaryGas} concentration increase: ${this.lastReading}ppm to ${reading}ppm`,
                0.8,
                'high',
                { 
                    previous_reading: this.lastReading,
                    current_reading: reading,
                    increase_rate: ((reading - this.lastReading) / this.lastReading * 100).toFixed(1) + '%',
                    gas_type: primaryGas
                }
            ));
        }
        
        // Ventilation failure (sustained high levels)
        if (reading > this.safeThreshold * 2 && this.leakState === 'normal') {
            patterns.push(this.generatePatternEvent(
                'ventilation_failure',
                `Sustained ${primaryGas} concentration without active leak: possible ventilation failure`,
                0.75,
                'medium',
                { 
                    concentration: reading,
                    expected_max: this.safeThreshold,
                    gas_type: primaryGas,
                    ventilation_effectiveness: 'compromised'
                }
            ));
        }
        
        // Multi-gas detection (if concentration is very high)
        if (reading > this.warningThreshold * 0.8) {
            patterns.push(this.generatePatternEvent(
                'multi_gas_event',
                `High concentration event may involve multiple gases: ${reading}ppm`,
                0.7,
                'high',
                { 
                    concentration: reading,
                    possible_gases: this.gasTypes,
                    primary_gas: primaryGas,
                    multi_gas_likelihood: 'high'
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
        
        // Degrade battery slightly (gas sensors use moderate power)
        this.degradeBattery();
        
        return {
            device_id: this.deviceId,
            type: 'gas',
            value: reading,
            status: status,
            metadata: metadata
        };
    }
}

module.exports = GasSensor;