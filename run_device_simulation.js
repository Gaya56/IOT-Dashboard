#!/usr/bin/env node
/**
 * Device-Type Specific Simulation Runner
 * 
 * Allows running simulations for specific device types with optimized configurations
 * This addresses the user's request to break simulation into parts for efficiency
 * 
 * Usage:
 *   node run_device_simulation.js [device-type] [options]
 */

const ManufacturingSimulation = require('./simulate_manufacturing');
const SensorFactory = require('./src/sensors/SensorFactory');

class DeviceTypeRunner {
    constructor() {
        this.supportedTypes = SensorFactory.getSupportedTypes();
    }

    // Get optimized configuration for each device type
    getDeviceConfig(deviceType) {
        const configs = {
            temperature: {
                iterations: 25,
                delay: 800,
                description: 'Temperature monitoring with drift detection'
            },
            vibration: {
                iterations: 30,
                delay: 600,
                description: 'Equipment vibration analysis with wear detection'
            },
            gas: {
                iterations: 20,
                delay: 1000,
                description: 'Gas leak detection and air quality monitoring'
            },
            humidity: {
                iterations: 15,
                delay: 1200,
                description: 'Environmental humidity control monitoring'
            },
            pressure: {
                iterations: 20,
                delay: 800,
                description: 'Pressure system monitoring'
            },
            motion: {
                iterations: 40,
                delay: 300,
                description: 'Motion detection for security and automation'
            },
            door: {
                iterations: 25,
                delay: 600,
                description: 'Access control and door status monitoring'
            },
            card: {
                iterations: 35,
                delay: 400,
                description: 'Card reader access logging'
            }
        };
        
        return configs[deviceType] || {
            iterations: 20,
            delay: 500,
            description: 'Generic device simulation'
        };
    }

    // Show usage information
    showUsage() {
        console.log(`
Device-Type Specific IoT Simulation Runner

Usage: node run_device_simulation.js <device-type> [options]

Supported Device Types:
${this.supportedTypes.map(type => `  ${type.padEnd(12)} - ${this.getDeviceConfig(type).description}`).join('\n')}

Options:
  --iterations=N    Override default iterations for device type
  --delay=N        Override default delay for device type  
  --verbose        Enable detailed logging
  --help          Show this help message

Examples:
  node run_device_simulation.js temperature
  node run_device_simulation.js vibration --verbose
  node run_device_simulation.js gas --iterations=50
  node run_device_simulation.js all  # Run all device types sequentially

Quick Commands (via npm):
  npm run manufacturing:temperature
  npm run manufacturing:vibration  
  npm run manufacturing:gas
        `);
    }

    // Run simulation for specific device type
    async runDeviceType(deviceType, options = {}) {
        const config = this.getDeviceConfig(deviceType);
        
        console.log(`🎯 Running ${deviceType.toUpperCase()} simulation`);
        console.log(`📋 ${config.description}`);
        console.log(`⚙️  Optimized config: ${config.iterations} iterations, ${config.delay}ms delay\n`);
        
        const simulationOptions = {
            iterations: options.iterations || config.iterations,
            delay: options.delay || config.delay,
            verbose: options.verbose || false,
            deviceType: deviceType,
            useSupabaseRegistry: true,
            patternDetection: true
        };
        
        const simulation = new ManufacturingSimulation(simulationOptions);
        await simulation.run();
    }

    // Run all device types sequentially
    async runAll(options = {}) {
        console.log('🌟 Running comprehensive manufacturing simulation for all device types\n');
        
        for (const deviceType of this.supportedTypes) {
            try {
                await this.runDeviceType(deviceType, {
                    ...options,
                    iterations: options.iterations || Math.floor(this.getDeviceConfig(deviceType).iterations * 0.7) // Reduce iterations for sequential run
                });
                
                console.log('\n' + '═'.repeat(60) + '\n');
                
                // Short pause between device types
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`❌ Error running ${deviceType} simulation:`, error.message);
            }
        }
        
        console.log('🏁 All device type simulations completed!');
    }

    // Parse command line arguments
    parseArgs() {
        const args = {
            deviceType: null,
            options: {}
        };
        
        const argv = process.argv.slice(2);
        
        if (argv.length === 0) {
            return args;
        }
        
        // First non-option argument is device type
        const deviceTypeArg = argv.find(arg => !arg.startsWith('--'));
        if (deviceTypeArg) {
            args.deviceType = deviceTypeArg.toLowerCase();
        }
        
        // Parse options
        argv.filter(arg => arg.startsWith('--')).forEach(arg => {
            const [key, value] = arg.substring(2).split('=');
            
            if (value === undefined) {
                args.options[key] = true;
            } else if (!isNaN(value)) {
                args.options[key] = parseInt(value);
            } else {
                args.options[key] = value;
            }
        });
        
        return args;
    }

    // Main execution
    async run() {
        const { deviceType, options } = this.parseArgs();
        
        if (options.help || !deviceType) {
            this.showUsage();
            return;
        }
        
        if (deviceType === 'all') {
            await this.runAll(options);
        } else if (this.supportedTypes.includes(deviceType)) {
            await this.runDeviceType(deviceType, options);
        } else {
            console.error(`❌ Unknown device type: ${deviceType}`);
            console.log(`Supported types: ${this.supportedTypes.join(', ')}`);
            process.exit(1);
        }
    }
}

// Main execution
async function main() {
    const runner = new DeviceTypeRunner();
    await runner.run();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Device simulation interrupted by user');
    process.exit(0);
});

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = DeviceTypeRunner;