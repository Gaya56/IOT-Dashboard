#!/usr/bin/env node

/**
 * Enhanced IoT Sensor Data Simulator
 * 
 * Generates realistic sensor data with enriched device metadata for dashboards and AI analysis
 * Supports 6 sensor types: temperature, door, card, humidity, motion, smoke
 * 
 * Enhanced metadata includes:
 * - device_name: Human-friendly device names
 * - location: Realistic room/zone identifiers
 * - battery_level: Current battery charge (0-100%)
 * - last_calibration: Recent calibration date (ISO format)
 * - manufacturer: Random manufacturer from predefined list
 * - system_health: Health status based on battery and other factors
 * 
 * Usage:
 *   node simulate_iot.js [--iterations=20] [--delay=500] [--verbose] [--enrich-metadata] [--no-enrich-metadata]
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_ANON_KEY - Supabase anonymous API key
 */

require('dotenv').config();
const axios = require('axios');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'https://itvndvydvyckxmdorxpd.supabase.co',
  supabaseKey: process.env.SUPABASE_ANON_KEY || '',
  iterations: 20,
  delay: 500, // milliseconds
  verbose: false,
  enrichMetadata: true // Default enabled for enhanced metadata
};

// Parse command line arguments
process.argv.forEach(arg => {
  if (arg.startsWith('--iterations=')) {
    config.iterations = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--delay=')) {
    config.delay = parseInt(arg.split('=')[1]);
  } else if (arg === '--verbose') {
    config.verbose = true;
  } else if (arg === '--enrich-metadata') {
    config.enrichMetadata = true;
  } else if (arg === '--no-enrich-metadata') {
    config.enrichMetadata = false;
  }
});

// Sensor types and their value ranges
const sensorTypes = ['temperature', 'door', 'card', 'humidity', 'motion', 'smoke'];

// Enhanced metadata pools
const manufacturers = ["Acme Sensors", "IoTCo", "TechDevices", "SmartSensor Inc", "ConnectedTech"];

const locationPools = {
  temperature: ["Server Room", "Office 101", "Conference Room A", "Lobby", "Storage Room", "Lab 1", "Lab 2", "Kitchen", "Reception", "Data Center"],
  door: ["Main Entrance", "Emergency Exit", "Office Door 101", "Conference Room A", "Storage Access", "Lab Entrance", "Kitchen Door", "Reception Desk", "Back Door", "Loading Bay"],
  card: ["Main Scanner", "Security Gate", "Lab Access", "Office Scanner", "VIP Entrance", "Emergency Access", "Parking Gate", "Storage Access", "Executive Floor", "R&D Wing"],
  humidity: ["Server Room", "Storage Area", "Greenhouse Lab", "Archive Room", "Chemical Storage", "Clean Room", "Production Floor", "Warehouse Zone A", "Cold Storage", "Laboratory"],
  motion: ["Hallway A", "Corridor B", "Stairwell 1", "Parking Lot", "Garden Path", "Loading Dock", "Emergency Route", "Main Corridor", "Side Passage", "Elevator Lobby"],
  smoke: ["Server Room", "Kitchen Area", "Storage Room", "Electrical Panel", "Workshop", "Laboratory", "Garage", "Mechanical Room", "Boiler Room", "Equipment Bay"]
};

// Device registry cache
const deviceRegistry = new Map();

// Results tracking
const results = {
  total: 0,
  successful: 0,
  failed: 0,
  sensorCounts: {},
  errors: []
};

/**
 * Generate a random date within the last 12 months
 */
function generateRecentCalibrationDate() {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const randomTime = twelveMonthsAgo.getTime() + Math.random() * (now.getTime() - twelveMonthsAgo.getTime());
  return new Date(randomTime).toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

/**
 * Calculate system health based on battery level and other factors
 */
function calculateSystemHealth(batteryLevel, sensorType, value) {
  // Primary health indicator: battery level
  if (batteryLevel < 20) return 'critical';
  if (batteryLevel < 40) return 'warning';
  
  // Secondary health indicators based on sensor readings
  switch (sensorType) {
    case 'temperature':
      if (value < 5 || value > 40) return 'warning'; // Extreme temperatures
      break;
    case 'humidity':
      if (value > 90) return 'warning'; // Very high humidity
      break;
    case 'smoke':
      if (value > 7) return 'critical'; // High smoke levels
      break;
  }
  
  return 'good';
}

/**
 * Generate human-friendly device name from device ID and sensor type
 */
function generateDeviceName(deviceId, sensorType) {
  const deviceNumber = deviceId.replace('device_', '');
  const typeNames = {
    temperature: 'Temperature Sensor',
    door: 'Door Monitor',
    card: 'Card Reader',
    humidity: 'Humidity Sensor',
    motion: 'Motion Detector',
    smoke: 'Smoke Detector'
  };
  
  return `${typeNames[sensorType]} ${deviceNumber.slice(-3).padStart(3, '0')}`;
}

/**
 * Get or create device metadata from registry
 */
function getOrCreateDeviceMetadata(deviceId, sensorType) {
  if (deviceRegistry.has(deviceId)) {
    // Return existing device metadata, but update battery level for realistic degradation
    const existingDevice = deviceRegistry.get(deviceId);
    
    // Simulate slight battery degradation over time (0.1% to 2% per event)
    if (Math.random() < 0.3) { // 30% chance of battery change
      existingDevice.battery_level = Math.max(0, existingDevice.battery_level - (Math.random() * 1.9 + 0.1));
      existingDevice.system_health = calculateSystemHealth(existingDevice.battery_level, sensorType, 0);
    }
    
    return existingDevice;
  }
  
  // Create new device metadata
  const batteryLevel = Math.random() * 100; // 0-100%
  const deviceMetadata = {
    device_name: generateDeviceName(deviceId, sensorType),
    location: locationPools[sensorType][Math.floor(Math.random() * locationPools[sensorType].length)],
    battery_level: parseFloat(batteryLevel.toFixed(1)),
    last_calibration: generateRecentCalibrationDate(),
    manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
    system_health: calculateSystemHealth(batteryLevel, sensorType, 0)
  };
  
  // Cache in registry
  deviceRegistry.set(deviceId, deviceMetadata);
  
  return deviceMetadata;
}

/**
 * Generate realistic sensor data based on type with enhanced metadata
 */
function generateSensorData(sensorType) {
  const deviceId = `device_${Math.floor(Math.random() * 1000000)}`;
  let sensorValue, deviceStatus, metadata;

  // Get or create enhanced device metadata
  const deviceMetadata = config.enrichMetadata ? getOrCreateDeviceMetadata(deviceId, sensorType) : {};

  switch (sensorType) {
    case 'temperature':
      sensorValue = parseFloat((Math.random() * 25 + 10).toFixed(1)); // 10-35°C
      deviceStatus = deviceMetadata.system_health === 'critical' ? 'malfunction' : 'active';
      metadata = {
        // Original metadata
        location: `room_${Math.floor(Math.random() * 20) + 1}`,
        unit: 'celsius',
        calibration_date: '2024-01-15',
        // Enhanced metadata
        ...(config.enrichMetadata && {
          ...deviceMetadata,
          location: deviceMetadata.location, // Override with enhanced location
          last_calibration: deviceMetadata.last_calibration, // Override with enhanced calibration
          sensor_range: '−40°C to +80°C',
          accuracy: '±0.5°C'
        })
      };
      break;
      
    case 'door':
      sensorValue = Math.random() > 0.5 ? 1 : 0; // 1 = open, 0 = closed
      deviceStatus = sensorValue === 1 ? 'open' : 'closed';
      metadata = {
        // Original metadata
        location: `entrance_${Math.floor(Math.random() * 10) + 1}`,
        door_type: 'main_entrance',
        access_level: 'public',
        // Enhanced metadata
        ...(config.enrichMetadata && {
          ...deviceMetadata,
          location: deviceMetadata.location, // Override with enhanced location
          door_type: Math.random() > 0.5 ? 'main_entrance' : 'emergency_exit',
          access_level: Math.random() > 0.7 ? 'restricted' : 'public'
        })
      };
      break;
      
    case 'card':
      sensorValue = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit card number
      deviceStatus = deviceMetadata.system_health === 'critical' ? 'read_error' : 'read_success';
      metadata = {
        // Original metadata
        location: `scanner_${Math.floor(Math.random() * 15) + 1}`,
        card_type: 'employee_id',
        encryption: 'AES256',
        // Enhanced metadata
        ...(config.enrichMetadata && {
          ...deviceMetadata,
          location: deviceMetadata.location, // Override with enhanced location
          card_type: ['employee_id', 'visitor_pass', 'contractor_badge'][Math.floor(Math.random() * 3)],
          encryption: ['AES256', 'RSA2048', 'ChaCha20'][Math.floor(Math.random() * 3)]
        })
      };
      break;
      
    case 'humidity':
      sensorValue = parseFloat((Math.random() * 100).toFixed(1)); // 0-100%
      deviceStatus = sensorValue > 80 ? 'high_humidity' : 'normal';
      metadata = {
        // Original metadata
        location: `zone_${Math.floor(Math.random() * 25) + 1}`,
        unit: 'percentage',
        sensor_model: 'DHT22',
        // Enhanced metadata
        ...(config.enrichMetadata && {
          ...deviceMetadata,
          location: deviceMetadata.location, // Override with enhanced location
          sensor_model: ['DHT22', 'SHT30', 'AM2320', 'HIH6130'][Math.floor(Math.random() * 4)],
          accuracy: '±2%'
        })
      };
      break;
      
    case 'motion':
      sensorValue = Math.random() > 0.7 ? 1 : 0; // 1 = motion, 0 = no motion
      deviceStatus = sensorValue === 1 ? 'motion_detected' : 'no_motion';
      metadata = {
        // Original metadata
        location: `corridor_${Math.floor(Math.random() * 12) + 1}`,
        detection_range: '5_meters',
        sensitivity: 'medium',
        // Enhanced metadata
        ...(config.enrichMetadata && {
          ...deviceMetadata,
          location: deviceMetadata.location, // Override with enhanced location
          detection_range: ['3_meters', '5_meters', '8_meters', '12_meters'][Math.floor(Math.random() * 4)],
          sensitivity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        })
      };
      break;
      
    case 'smoke':
      sensorValue = parseFloat((Math.random() * 10).toFixed(2)); // 0-10 smoke density
      deviceStatus = sensorValue > 5 ? 'alert' : 'safe';
      metadata = {
        // Original metadata
        location: `fire_zone_${Math.floor(Math.random() * 8) + 1}`,
        unit: 'ppm',
        alarm_threshold: '5.0',
        // Enhanced metadata
        ...(config.enrichMetadata && {
          ...deviceMetadata,
          location: deviceMetadata.location, // Override with enhanced location
          alarm_threshold: ['3.0', '5.0', '7.0'][Math.floor(Math.random() * 3)],
          detector_type: 'photoelectric'
        })
      };
      break;
      
    default:
      throw new Error(`Unknown sensor type: ${sensorType}`);
  }

  // Update system health based on current sensor value
  if (config.enrichMetadata && deviceMetadata) {
    metadata.system_health = calculateSystemHealth(deviceMetadata.battery_level, sensorType, sensorValue);
  }

  return {
    device_id: deviceId,
    type: sensorType,
    value: sensorValue,
    status: deviceStatus,
    metadata: metadata
  };
}

/**
 * Send sensor data to Supabase
 */
async function sendSensorData(sensorData) {
  try {
    const response = await axios.post(
      `${config.supabaseUrl}/rest/v1/iot_events`,
      sensorData,
      {
        headers: {
          'apikey': config.supabaseKey,
          'Authorization': `Bearer ${config.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );
    
    results.successful++;
    if (config.verbose) {
      console.log(`✅ Sent ${sensorData.type} data:`, sensorData);
      console.log(`📄 Response:`, response.data);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    results.failed++;
    results.errors.push({
      sensorData,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    if (config.verbose) {
      console.error(`❌ Failed to send ${sensorData.type} data:`, error.message);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Verify data insertion and display enhanced metadata analysis
 */
async function verifyDataInsertion() {
  try {
    console.log('\n🔍 Verifying data insertion...');
    
    const response = await axios.get(
      `${config.supabaseUrl}/rest/v1/iot_events?select=*&order=created_at.desc&limit=50`,
      {
        headers: {
          'apikey': config.supabaseKey,
          'Authorization': `Bearer ${config.supabaseKey}`
        }
      }
    );
    
    const events = response.data;
    console.log(`📊 Found ${events.length} recent events in database`);
    
    // Count events by sensor type
    const typeCounts = {};
    events.forEach(event => {
      typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
    });
    
    console.log('\n📈 Recent events by sensor type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} events`);
    });
    
    // Enhanced metadata analysis
    if (config.enrichMetadata && events.length > 0) {
      console.log('\n🔧 Enhanced Metadata Analysis:');
      
      const enrichedEvents = events.filter(event => event.metadata && event.metadata.device_name);
      console.log(`📊 Enhanced events: ${enrichedEvents.length}/${events.length}`);
      
      if (enrichedEvents.length > 0) {
        // Battery level analysis
        const batteryLevels = enrichedEvents
          .filter(event => event.metadata.battery_level !== undefined)
          .map(event => event.metadata.battery_level);
        
        if (batteryLevels.length > 0) {
          const avgBattery = (batteryLevels.reduce((a, b) => a + b, 0) / batteryLevels.length).toFixed(1);
          const lowBattery = batteryLevels.filter(level => level < 20).length;
          console.log(`🔋 Battery Status: Avg ${avgBattery}%, ${lowBattery} devices below 20%`);
        }
        
        // System health analysis
        const healthCounts = {};
        enrichedEvents.forEach(event => {
          const health = event.metadata.system_health || 'unknown';
          healthCounts[health] = (healthCounts[health] || 0) + 1;
        });
        
        console.log('🏥 System Health Distribution:');
        Object.entries(healthCounts).forEach(([health, count]) => {
          console.log(`  ${health}: ${count} devices`);
        });
        
        // Manufacturer distribution
        const manufacturerCounts = {};
        enrichedEvents.forEach(event => {
          const manufacturer = event.metadata.manufacturer || 'unknown';
          manufacturerCounts[manufacturer] = (manufacturerCounts[manufacturer] || 0) + 1;
        });
        
        console.log('🏭 Manufacturing Distribution:');
        Object.entries(manufacturerCounts).forEach(([manufacturer, count]) => {
          console.log(`  ${manufacturer}: ${count} devices`);
        });
      }
    }
    
    // Show sample events with enhanced metadata
    if (events.length > 0) {
      console.log('\n📝 Sample recent events:');
      events.slice(0, 5).forEach((event, index) => {
        const deviceName = event.metadata?.device_name || event.device_id;
        const location = event.metadata?.location || 'Unknown';
        const battery = event.metadata?.battery_level ? `${event.metadata.battery_level}%` : 'N/A';
        const health = event.metadata?.system_health || 'N/A';
        
        console.log(`  ${index + 1}. ${deviceName} (${event.type})`);
        console.log(`     📍 ${location} | 🔋 ${battery} | 🏥 ${health} | 📊 ${event.value} (${event.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to verify data insertion:', error.message);
  }
}

/**
 * Display device registry summary
 */
function displayDeviceRegistry() {
  if (config.enrichMetadata && deviceRegistry.size > 0) {
    console.log(`\n📋 Device Registry Summary (${deviceRegistry.size} devices):`);
    
    // Group devices by type
    const devicesByType = {};
    for (const [deviceId, metadata] of deviceRegistry.entries()) {
      // Extract sensor type from device name
      const sensorType = metadata.device_name.toLowerCase().includes('temperature') ? 'temperature' :
                        metadata.device_name.toLowerCase().includes('door') ? 'door' :
                        metadata.device_name.toLowerCase().includes('card') ? 'card' :
                        metadata.device_name.toLowerCase().includes('humidity') ? 'humidity' :
                        metadata.device_name.toLowerCase().includes('motion') ? 'motion' :
                        metadata.device_name.toLowerCase().includes('smoke') ? 'smoke' : 'unknown';
      
      if (!devicesByType[sensorType]) devicesByType[sensorType] = [];
      devicesByType[sensorType].push({ deviceId, ...metadata });
    }
    
    Object.entries(devicesByType).forEach(([type, devices]) => {
      console.log(`  ${type}: ${devices.length} devices`);
      devices.slice(0, 2).forEach(device => {
        console.log(`    - ${device.device_name} | 📍 ${device.location} | 🔋 ${device.battery_level}% | 🏥 ${device.system_health}`);
      });
      if (devices.length > 2) {
        console.log(`    ... and ${devices.length - 2} more`);
      }
    });
  }
}

/**
 * Main simulation function
 */
async function runSimulation() {
  console.log('🚀 Starting Enhanced IoT Sensor Data Simulation');
  console.log(`📊 Configuration: ${config.iterations} iterations, ${config.delay}ms delay`);
  console.log(`🔗 Supabase URL: ${config.supabaseUrl}`);
  console.log(`🔑 API Key: ${config.supabaseKey ? 'Configured' : 'Missing!'}`);
  console.log(`🔧 Enhanced Metadata: ${config.enrichMetadata ? 'Enabled' : 'Disabled'}`);
  
  if (!config.supabaseKey) {
    console.error('❌ SUPABASE_ANON_KEY environment variable is required');
    process.exit(1);
  }

  // Initialize sensor counts
  sensorTypes.forEach(type => {
    results.sensorCounts[type] = 0;
  });

  console.log('\n📡 Starting data transmission...\n');
  
  for (let i = 0; i < config.iterations; i++) {
    // Randomly select sensor type
    const randomSensorIndex = Math.floor(Math.random() * sensorTypes.length);
    const sensorType = sensorTypes[randomSensorIndex];
    
    // Generate and send data
    const sensorData = generateSensorData(sensorType);
    results.total++;
    results.sensorCounts[sensorType]++;
    
    if (!config.verbose) {
      process.stdout.write(`📤 Sending ${sensorType} data (${i + 1}/${config.iterations})...\r`);
    }
    
    await sendSensorData(sensorData);
    
    // Delay between requests
    if (i < config.iterations - 1) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }
  }

  console.log('\n\n🎉 Enhanced Simulation Complete!');
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`  Total events: ${results.total}`);
  console.log(`  Successful: ${results.successful}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Success rate: ${((results.successful / results.total) * 100).toFixed(1)}%`);
  console.log(`  Enhanced metadata: ${config.enrichMetadata ? 'Yes' : 'No'}`);
  
  console.log('\n📈 Events by sensor type:');
  Object.entries(results.sensorCounts).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} events`);
  });
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.slice(0, 3).forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.error} (${error.status || 'No status'})`);
    });
    
    if (results.errors.length > 3) {
      console.log(`  ... and ${results.errors.length - 3} more errors`);
    }
  }
  
  // Display device registry summary
  displayDeviceRegistry();
  
  // Verify data insertion with enhanced analysis
  await verifyDataInsertion();
}

// Run the simulation
runSimulation().catch(error => {
  console.error('💥 Enhanced simulation failed:', error.message);
  process.exit(1);
});