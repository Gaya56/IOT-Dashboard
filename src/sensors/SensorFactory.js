// Sensor factory - creates appropriate sensor instances based on device type
// Centralizes sensor instantiation and type mapping

const TemperatureSensor = require('./TemperatureSensor');
const VibrationSensor = require('./VibrationSensor');
const GasSensor = require('./GasSensor');
const BaseSensor = require('./BaseSensor');

// Simple sensor implementations for remaining types
class HumiditySensor extends BaseSensor {
    generateReading() {
        return Math.round((30 + Math.random() * 50) * 10) / 10; // 30-80% humidity
    }
    
    getStatus(reading) {
        if (reading > 80) return 'high_humidity';
        if (reading < 30) return 'low_humidity';
        return 'normal';
    }
    
    generateEvent() {
        const reading = this.generateReading();
        return {
            device_id: this.deviceId,
            type: 'humidity',
            value: reading,
            status: this.getStatus(reading),
            metadata: {
                ...this.generateBaseMetadata(),
                unit: 'percent',
                optimal_range: '40-60%'
            }
        };
    }
}

class PressureSensor extends BaseSensor {
    generateReading() {
        return Math.round((10 + Math.random() * 80) * 100) / 100; // 10-90 PSI
    }
    
    getStatus(reading) {
        if (reading > 85) return 'high_pressure';
        if (reading < 15) return 'low_pressure';
        return 'normal';
    }
    
    generateEvent() {
        const reading = this.generateReading();
        return {
            device_id: this.deviceId,
            type: 'pressure',
            value: reading,
            status: this.getStatus(reading),
            metadata: {
                ...this.generateBaseMetadata(),
                unit: 'psi',
                operating_range: '10-90 PSI'
            }
        };
    }
}

class MotionSensor extends BaseSensor {
    generateReading() {
        return Math.random() > 0.4 ? 1 : 0; // 60% chance of motion
    }
    
    getStatus(reading) {
        return reading === 1 ? 'motion_detected' : 'no_motion';
    }
    
    generateEvent() {
        const reading = this.generateReading();
        return {
            device_id: this.deviceId,
            type: 'motion',
            value: reading,
            status: this.getStatus(reading),
            metadata: {
                ...this.generateBaseMetadata(),
                detection_range: '12 meters',
                sensitivity: 'medium'
            }
        };
    }
}

class DoorSensor extends BaseSensor {
    generateReading() {
        return Math.random() > 0.7 ? 1 : 0; // 30% chance door is open
    }
    
    getStatus(reading) {
        return reading === 1 ? 'open' : 'closed';
    }
    
    generateEvent() {
        const reading = this.generateReading();
        return {
            device_id: this.deviceId,
            type: 'door',
            value: reading,
            status: this.getStatus(reading),
            metadata: {
                ...this.generateBaseMetadata(),
                door_type: 'security',
                access_level: 'restricted'
            }
        };
    }
}

class CardSensor extends BaseSensor {
    generateReading() {
        return Math.floor(10000000 + Math.random() * 90000000); // 8-digit card numbers
    }
    
    getStatus() {
        return Math.random() > 0.1 ? 'read_success' : 'read_error';
    }
    
    generateEvent() {
        const reading = this.generateReading();
        return {
            device_id: this.deviceId,
            type: 'card',
            value: reading,
            status: this.getStatus(),
            metadata: {
                ...this.generateBaseMetadata(),
                card_type: 'rfid',
                encryption: 'AES-256'
            }
        };
    }
}

class SmokeSensor extends BaseSensor {
    generateReading() {
        return Math.round((1.0 + Math.random() * 9.0) * 100) / 100; // 1.0-10.0 concentration
    }
    
    getStatus(reading) {
        if (reading > 7.0) return 'smoke_detected';
        if (reading > 5.0) return 'elevated_smoke';
        return 'normal';
    }
    
    generateEvent() {
        const reading = this.generateReading();
        return {
            device_id: this.deviceId,
            type: 'smoke',
            value: reading,
            status: this.getStatus(reading),
            metadata: {
                ...this.generateBaseMetadata(),
                unit: 'concentration',
                sensor_type: 'photoelectric',
                alarm_threshold: '7.0'
            }
        };
    }
}

class SensorFactory {
    static createSensor(device) {
        const sensorMap = {
            'temperature': TemperatureSensor,
            'vibration': VibrationSensor,
            'gas': GasSensor,
            'humidity': HumiditySensor,
            'pressure': PressureSensor,
            'motion': MotionSensor,
            'door': DoorSensor,
            'card': CardSensor,
            'smoke': SmokeSensor
        };
        
        const SensorClass = sensorMap[device.type_name];
        if (!SensorClass) {
            throw new Error(`Unknown sensor type: ${device.type_name}`);
        }
        
        return new SensorClass(device);
    }
    
    static getSupportedTypes() {
        return ['temperature', 'vibration', 'gas', 'humidity', 'pressure', 'motion', 'door', 'card', 'smoke'];
    }
}

module.exports = SensorFactory;