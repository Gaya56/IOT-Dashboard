#!/usr/bin/env node
/**
 * Enhanced IoT Manufacturing Simulation - Step 9
 * 
 * This script simulates a realistic manufacturing facility with registered IoT devices.
 * It uses the device registry from Supabase to generate meaningful sensor data.
 * 
 * Features:
 * - Device registry integration
 * - Modular sensor system
 * - Anomaly detection and pattern events
 * - Battery degradation simulation
 * - Multiple sensor types: temperature, vibration, gas, pressure, humidity, motion, door, card
 * 
 * Usage:
 *   node simulate_manufacturing.js [options]
 *   
 * Options:
 *   --iterations=N        Number of simulation iterations (default: 20)
 *   --delay=N             Delay between iterations in ms (default: 500)
 *   --verbose             Enable verbose logging
 *   --use-supabase-registry  Use device registry from database (default: true)
 *   --device-type=TYPE    Simulate only specific device type
 *   --pattern-detection   Enable anomaly pattern detection (default: true)
 */

const DatabaseClient = require('./src/database');
const SensorFactory = require('./src/sensors/SensorFactory');
require('dotenv').config();

class ManufacturingSimulation {
    constructor(options = {}) {
        this.iterations = parseInt(options.iterations) || 20;
        this.delay = parseInt(options.delay) || 500;
        this.verbose = options.verbose || false;
        this.useSupabaseRegistry = options.useSupabaseRegistry !== false;
        this.deviceType = options.deviceType || null;
        this.patternDetection = options.patternDetection !== false;
        
        this.db = new DatabaseClient();
        this.stats = {
            totalEvents: 0,
            successfulEvents: 0,
            failedEvents: 0,
            patternEvents: 0,
            deviceStats: new Map(),
            sensorTypeStats: new Map()
        };
        
        this.sensors = new Map(); // Cache sensor instances
    }

    // Initialize simulation
    async initialize() {
        console.log('🚀 Starting Enhanced Manufacturing IoT Simulation');
        console.log(`📊 Configuration: ${this.iterations} iterations, ${this.delay}ms delay`);
        
        // Test database connection
        const connected = await this.db.testConnection();
        if (!connected) {
            throw new Error('❌ Failed to connect to database');
        }
        
        console.log('✅ Database connection established');
        
        if (this.useSupabaseRegistry) {
            console.log('📋 Using Supabase device registry');
        } else {
            console.log('⚠️  Using fallback device generation');
        }
        
        if (this.deviceType) {
            console.log(`🔧 Filtering to device type: ${this.deviceType}`);
        }
        
        if (this.patternDetection) {
            console.log('🔍 Anomaly pattern detection enabled');
        }
    }

    // Get or create sensor instance
    getSensor(device) {
        const cacheKey = device.device_id;
        
        if (!this.sensors.has(cacheKey)) {
            try {
                const sensor = SensorFactory.createSensor(device);
                this.sensors.set(cacheKey, sensor);
            } catch (error) {
                console.warn(`⚠️  Failed to create sensor for ${device.type_name}: ${error.message}`);
                return null;
            }
        }
        
        return this.sensors.get(cacheKey);
    }

    // Generate and send sensor event
    async generateEvent() {
        try {
            // Get device from registry or random selection
            let device;
            if (this.useSupabaseRegistry) {
                device = await this.db.getRandomDevice(this.deviceType);
            } else {
                // Fallback to old method if registry fails
                device = this.generateFallbackDevice();
            }
            
            if (!device) {
                throw new Error('No devices available for simulation');
            }
            
            // Get or create sensor instance
            const sensor = this.getSensor(device);
            if (!sensor) {
                throw new Error(`Failed to create sensor for device: ${device.device_id}`);
            }
            
            // Generate sensor event
            const eventData = sensor.generateEvent();
            
            if (this.verbose) {
                console.log(`📡 Generating ${eventData.type} event for ${device.device_name}:`, {
                    device_id: eventData.device_id,
                    value: eventData.value,
                    status: eventData.status,
                    location: eventData.metadata.location,
                    battery: eventData.metadata.battery_level
                });
            }
            
            // Insert event into database
            const result = await this.db.insertEvent(eventData);
            
            if (result && result.length > 0) {
                this.stats.successfulEvents++;
                this.updateStats(eventData.type, device.device_id);
                
                if (this.verbose) {
                    console.log(`✅ Event inserted with ID: ${result[0].id}`);
                }
                
                // Update device battery level in database
                if (eventData.metadata.battery_level !== device.battery_level) {
                    await this.db.updateDeviceBattery(device.device_id, eventData.metadata.battery_level);
                }
                
                // Pattern detection for advanced sensors
                if (this.patternDetection && sensor.detectAnomalies) {
                    await this.detectAndInsertPatterns(sensor, eventData.value);
                }
                
            } else {
                this.stats.failedEvents++;
                console.warn(`⚠️  Event insertion returned no data for ${device.device_id}`);
            }
            
            this.stats.totalEvents++;
            
        } catch (error) {
            this.stats.failedEvents++;
            this.stats.totalEvents++;
            console.error('❌ Error generating event:', error.message);
            
            if (this.verbose) {
                console.error('Full error:', error);
            }
        }
    }

    // Detect anomalies and insert pattern events
    async detectAndInsertPatterns(sensor, reading) {
        try {
            if (typeof sensor.detectAnomalies === 'function') {
                const patterns = sensor.detectAnomalies(reading);
                
                for (const pattern of patterns) {
                    await this.db.insertPatternEvent(pattern);
                    this.stats.patternEvents++;
                    
                    if (this.verbose) {
                        console.log(`🔍 Pattern detected: ${pattern.pattern_type} (confidence: ${pattern.confidence_score})`);
                    }
                }
            }
        } catch (error) {
            console.warn(`⚠️  Pattern detection error: ${error.message}`);
        }
    }

    // Update statistics
    updateStats(sensorType, deviceId) {
        // Update sensor type stats
        const currentCount = this.stats.sensorTypeStats.get(sensorType) || 0;
        this.stats.sensorTypeStats.set(sensorType, currentCount + 1);
        
        // Update device stats
        const deviceCount = this.stats.deviceStats.get(deviceId) || 0;
        this.stats.deviceStats.set(deviceId, deviceCount + 1);
    }

    // Generate fallback device if registry is unavailable
    generateFallbackDevice() {
        const deviceTypes = ['temperature', 'vibration', 'gas', 'humidity', 'pressure', 'motion', 'door', 'card'];
        const filteredTypes = this.deviceType ? [this.deviceType] : deviceTypes;
        const type = filteredTypes[Math.floor(Math.random() * filteredTypes.length)];
        
        return {
            device_id: `fallback_${type}_${Math.floor(Math.random() * 1000)}`,
            type_name: type,
            device_name: `${type.charAt(0).toUpperCase() + type.slice(1)} Sensor`,
            location_name: 'Simulation Area',
            manufacturer_name: 'Simulation Manufacturer',
            battery_level: 50 + Math.random() * 50,
            sensor_range: this.getDefaultRange(type),
            unit: this.getDefaultUnit(type)
        };
    }

    // Get default sensor range for fallback
    getDefaultRange(type) {
        const ranges = {
            temperature: '-40°C to +80°C',
            vibration: '0-10g amplitude',
            gas: '0-1000 ppm',
            humidity: '0-100%',
            pressure: '0-100 PSI',
            motion: 'Binary detection',
            door: 'Open/Closed state',
            card: 'Card ID numbers'
        };
        return ranges[type] || 'Unknown';
    }

    // Get default unit for fallback
    getDefaultUnit(type) {
        const units = {
            temperature: 'celsius',
            vibration: 'g',
            gas: 'ppm',
            humidity: 'percent',
            pressure: 'psi',
            motion: 'boolean',
            door: 'boolean',
            card: 'numeric'
        };
        return units[type] || 'unknown';
    }

    // Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Run main simulation loop
    async run() {
        try {
            await this.initialize();
            
            console.log('🎬 Starting simulation loop...\n');
            
            for (let i = 0; i < this.iterations; i++) {
                const progress = Math.round((i / this.iterations) * 100);
                process.stdout.write(`\r📤 Progress: ${i + 1}/${this.iterations} (${progress}%)`);
                
                await this.generateEvent();
                
                if (i < this.iterations - 1) {
                    await this.sleep(this.delay);
                }
            }
            
            console.log('\n\n🎉 Manufacturing Simulation Complete!\n');
            this.printSummary();
            
        } catch (error) {
            console.error('\n❌ Simulation failed:', error.message);
            if (this.verbose) {
                console.error('Full error:', error);
            }
            process.exit(1);
        }
    }

    // Print simulation summary
    printSummary() {
        console.log('📊 SIMULATION SUMMARY');
        console.log('══════════════════════════════════════════════════');
        console.log(`Total Events: ${this.stats.totalEvents}`);
        console.log(`Successful: ${this.stats.successfulEvents}`);
        console.log(`Failed: ${this.stats.failedEvents}`);
        console.log(`Pattern Events: ${this.stats.patternEvents}`);
        console.log(`Success Rate: ${((this.stats.successfulEvents / this.stats.totalEvents) * 100).toFixed(1)}%`);
        
        if (this.stats.sensorTypeStats.size > 0) {
            console.log('\n📈 Events by Sensor Type:');
            for (const [type, count] of this.stats.sensorTypeStats.entries()) {
                console.log(`  ${type}: ${count} events`);
            }
        }
        
        console.log(`\n🔧 Active Sensor Instances: ${this.sensors.size}`);
        console.log(`📋 Registry Mode: ${this.useSupabaseRegistry ? 'Supabase' : 'Fallback'}`);
        console.log(`🔍 Pattern Detection: ${this.patternDetection ? 'Enabled' : 'Disabled'}`);
        
        if (this.deviceType) {
            console.log(`🎯 Device Filter: ${this.deviceType}`);
        }
    }
}

// Parse command line arguments
function parseArgs() {
    const args = {};
    
    process.argv.slice(2).forEach(arg => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            
            if (value === undefined) {
                args[key] = true;
            } else if (!isNaN(value)) {
                args[key] = parseInt(value);
            } else {
                args[key] = value;
            }
        }
    });
    
    return args;
}

// Main execution
async function main() {
    const options = parseArgs();
    
    // Show help
    if (options.help) {
        console.log(`
Enhanced Manufacturing IoT Simulation - Step 9

Usage: node simulate_manufacturing.js [options]

Options:
  --iterations=N          Number of simulation iterations (default: 20)
  --delay=N              Delay between iterations in ms (default: 500)  
  --verbose              Enable verbose logging
  --use-supabase-registry Use device registry from database (default: true)
  --device-type=TYPE     Simulate only specific device type
  --pattern-detection    Enable anomaly pattern detection (default: true)
  --help                 Show this help message

Supported Device Types:
  temperature, vibration, gas, humidity, pressure, motion, door, card

Examples:
  node simulate_manufacturing.js --iterations=50 --delay=200 --verbose
  node simulate_manufacturing.js --device-type=vibration --pattern-detection
  node simulate_manufacturing.js --iterations=10 --no-use-supabase-registry
        `);
        return;
    }
    
    const simulation = new ManufacturingSimulation(options);
    await simulation.run();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Simulation interrupted by user');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error.message);
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = ManufacturingSimulation;