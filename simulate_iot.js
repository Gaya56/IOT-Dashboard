#!/usr/bin/env node

/**
 * IoT Sensor Data Simulator
 * 
 * Generates realistic sensor data and sends it directly to Supabase REST API
 * Supports 6 sensor types: temperature, door, card, humidity, motion, smoke
 * 
 * Usage:
 *   node simulate_iot.js [--iterations=20] [--delay=500] [--verbose]
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
  verbose: false
};

// Parse command line arguments
process.argv.forEach(arg => {
  if (arg.startsWith('--iterations=')) {
    config.iterations = parseInt(arg.split('=')[1]);
  } else if (arg.startsWith('--delay=')) {
    config.delay = parseInt(arg.split('=')[1]);
  } else if (arg === '--verbose') {
    config.verbose = true;
  }
});

// Sensor types and their value ranges
const sensorTypes = ['temperature', 'door', 'card', 'humidity', 'motion', 'smoke'];

// Results tracking
const results = {
  total: 0,
  successful: 0,
  failed: 0,
  sensorCounts: {},
  errors: []
};

/**
 * Generate realistic sensor data based on type
 */
function generateSensorData(sensorType) {
  const deviceId = `device_${Math.floor(Math.random() * 1000000)}`;
  let sensorValue, deviceStatus, metadata;

  switch (sensorType) {
    case 'temperature':
      sensorValue = parseFloat((Math.random() * 25 + 10).toFixed(1)); // 10-35°C
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
      sensorValue = parseFloat((Math.random() * 100).toFixed(1)); // 0-100%
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
      sensorValue = parseFloat((Math.random() * 10).toFixed(2)); // 0-10 smoke density
      deviceStatus = sensorValue > 5 ? 'alert' : 'safe';
      metadata = {
        location: `fire_zone_${Math.floor(Math.random() * 8) + 1}`,
        unit: 'ppm',
        alarm_threshold: '5.0'
      };
      break;
      
    default:
      throw new Error(`Unknown sensor type: ${sensorType}`);
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
 * Verify data insertion by querying the API
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
    
    // Show sample events
    if (events.length > 0) {
      console.log('\n📝 Sample recent events:');
      events.slice(0, 5).forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.type} | Device: ${event.device_id} | Value: ${event.value} | Status: ${event.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to verify data insertion:', error.message);
  }
}

/**
 * Main simulation function
 */
async function runSimulation() {
  console.log('🚀 Starting IoT Sensor Data Simulation');
  console.log(`📊 Configuration: ${config.iterations} iterations, ${config.delay}ms delay`);
  console.log(`🔗 Supabase URL: ${config.supabaseUrl}`);
  console.log(`🔑 API Key: ${config.supabaseKey ? 'Configured' : 'Missing!'}`);
  
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

  console.log('\n\n🎉 Simulation Complete!');
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`  Total events: ${results.total}`);
  console.log(`  Successful: ${results.successful}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Success rate: ${((results.successful / results.total) * 100).toFixed(1)}%`);
  
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
  
  // Verify data insertion
  await verifyDataInsertion();
}

// Run the simulation
runSimulation().catch(error => {
  console.error('💥 Simulation failed:', error.message);
  process.exit(1);
});