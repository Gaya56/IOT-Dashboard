#!/usr/bin/env node

/**
 * IoT Analytics Script - Step 7 Implementation
 * 
 * Generates comprehensive analytics and health monitoring reports from IoT sensor data
 * Utilizes automated summary tables (sensor_stats, device_health) for efficient reporting
 * 
 * Features:
 * - Real-time analytics from summary tables
 * - Device health monitoring and alerts
 * - Multiple output formats (console, JSON, Markdown)
 * - Configurable reporting options
 * - Comprehensive error handling
 * 
 * Usage:
 *   node analyze_data.js [options]
 *   
 * Options:
 *   --report-file=<filename>  Export report to file
 *   --format=<json|markdown>  Report format (default: console)
 *   --verbose                 Detailed output
 *   --health-alerts           Show only critical health issues
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_ANON_KEY - Supabase anonymous API key
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'https://itvndvydvyckxmdorxpd.supabase.co',
  supabaseKey: process.env.SUPABASE_ANON_KEY || '',
  reportFile: null,
  format: 'console', // console, json, markdown
  verbose: false,
  healthAlerts: false
};

// Parse command line arguments
process.argv.forEach(arg => {
  if (arg.startsWith('--report-file=')) {
    config.reportFile = arg.split('=')[1];
  } else if (arg.startsWith('--format=')) {
    config.format = arg.split('=')[1];
  } else if (arg === '--verbose') {
    config.verbose = true;
  } else if (arg === '--health-alerts') {
    config.healthAlerts = true;
  }
});

// Analytics results storage
const analyticsData = {
  timestamp: new Date().toISOString(),
  summary: {},
  sensorStats: [],
  deviceHealth: [],
  alerts: [],
  trends: {}
};

/**
 * Make authenticated request to Supabase REST API
 */
async function supabaseRequest(endpoint, params = {}) {
  try {
    const url = `${config.supabaseUrl}/rest/v1/${endpoint}`;
    const queryParams = new URLSearchParams(params);
    
    const response = await axios.get(`${url}?${queryParams}`, {
      headers: {
        'apikey': config.supabaseKey,
        'Authorization': `Bearer ${config.supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    };
  }
}

/**
 * Fetch sensor statistics from summary table
 */
async function fetchSensorStats() {
  if (config.verbose) console.log('📊 Fetching sensor statistics...');
  
  const result = await supabaseRequest('sensor_stats', { 
    select: '*',
    order: 'event_count.desc'
  });
  
  if (!result.success) {
    throw new Error(`Failed to fetch sensor stats: ${result.error}`);
  }
  
  analyticsData.sensorStats = result.data;
  return result.data;
}

/**
 * Fetch device health data from summary table
 */
async function fetchDeviceHealth() {
  if (config.verbose) console.log('🏥 Fetching device health data...');
  
  const result = await supabaseRequest('device_health', { 
    select: '*',
    order: 'last_updated.desc'
  });
  
  if (!result.success) {
    throw new Error(`Failed to fetch device health: ${result.error}`);
  }
  
  analyticsData.deviceHealth = result.data;
  return result.data;
}

/**
 * Fetch recent IoT events for trend analysis
 */
async function fetchRecentEvents() {
  if (config.verbose) console.log('📈 Fetching recent events for trend analysis...');
  
  const result = await supabaseRequest('iot_events', { 
    select: 'type,value,status,created_at,device_id',
    order: 'created_at.desc',
    limit: '100'
  });
  
  if (!result.success) {
    throw new Error(`Failed to fetch recent events: ${result.error}`);
  }
  
  return result.data;
}

/**
 * Calculate summary statistics
 */
function calculateSummary(sensorStats, deviceHealth, recentEvents) {
  const summary = {
    totalSensors: sensorStats.length,
    totalDevices: deviceHealth.length,
    totalEvents: sensorStats.reduce((sum, sensor) => sum + parseInt(sensor.event_count), 0),
    recentEvents: recentEvents.length,
    healthDistribution: {
      good: deviceHealth.filter(d => d.health_status === 'good').length,
      warning: deviceHealth.filter(d => d.health_status === 'warning').length,
      critical: deviceHealth.filter(d => d.health_status === 'critical').length
    },
    averageBattery: deviceHealth.reduce((sum, d) => sum + (d.latest_battery_level || 0), 0) / deviceHealth.length
  };
  
  analyticsData.summary = summary;
  return summary;
}

/**
 * Generate health alerts for critical devices
 */
function generateHealthAlerts(deviceHealth) {
  const alerts = [];
  
  deviceHealth.forEach(device => {
    if (device.health_status === 'critical') {
      alerts.push({
        type: 'CRITICAL',
        device_id: device.device_id,
        issue: 'Critical health status',
        battery_level: device.latest_battery_level,
        last_updated: device.last_updated
      });
    } else if (device.health_status === 'warning' && device.latest_battery_level < 20) {
      alerts.push({
        type: 'WARNING',
        device_id: device.device_id,
        issue: 'Low battery level',
        battery_level: device.latest_battery_level,
        last_updated: device.last_updated
      });
    }
  });
  
  analyticsData.alerts = alerts;
  return alerts;
}

/**
 * Analyze trends from recent events
 */
function analyzeTrends(recentEvents) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const recentEventsToday = recentEvents.filter(event => 
    new Date(event.created_at) > oneDayAgo
  );
  
  const eventsByType = {};
  const eventsByHour = {};
  const manufacturerCount = {};
  
  recentEvents.forEach(event => {
    // Events by type
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    
    // Events by hour
    const hour = new Date(event.created_at).getHours();
    eventsByHour[hour] = (eventsByHour[hour] || 0) + 1;
  });
  
  // Count manufacturers from device health data
  analyticsData.deviceHealth.forEach(device => {
    if (device.manufacturer) {
      manufacturerCount[device.manufacturer] = (manufacturerCount[device.manufacturer] || 0) + 1;
    }
  });
  
  const trends = {
    eventsToday: recentEventsToday.length,
    eventsByType,
    eventsByHour,
    manufacturerDistribution: manufacturerCount,
    peakHour: Object.keys(eventsByHour).reduce((a, b) => 
      eventsByHour[a] > eventsByHour[b] ? a : b, 0
    )
  };
  
  analyticsData.trends = trends;
  return trends;
}

/**
 * Format output for console display
 */
function formatConsoleOutput() {
  const { summary, sensorStats, deviceHealth, alerts, trends } = analyticsData;
  
  let output = '';
  
  output += '🚀 IoT Analytics Report\n';
  output += '='.repeat(50) + '\n';
  output += `📅 Generated: ${new Date(analyticsData.timestamp).toLocaleString()}\n\n`;
  
  // Summary
  output += '📊 SYSTEM SUMMARY\n';
  output += '-'.repeat(30) + '\n';
  output += `Total Sensor Types: ${summary.totalSensors}\n`;
  output += `Total Devices: ${summary.totalDevices}\n`;
  output += `Total Events: ${summary.totalEvents.toLocaleString()}\n`;
  output += `Recent Events (last 100): ${summary.recentEvents}\n`;
  output += `Average Battery Level: ${summary.averageBattery.toFixed(1)}%\n\n`;
  
  // Health Distribution
  output += '🏥 DEVICE HEALTH STATUS\n';
  output += '-'.repeat(30) + '\n';
  output += `✅ Good: ${summary.healthDistribution.good} devices\n`;
  output += `⚠️  Warning: ${summary.healthDistribution.warning} devices\n`;
  output += `🚨 Critical: ${summary.healthDistribution.critical} devices\n\n`;
  
  // Sensor Statistics
  if (sensorStats.length > 0) {
    output += '📈 SENSOR STATISTICS\n';
    output += '-'.repeat(30) + '\n';
    sensorStats.forEach(sensor => {
      output += `${sensor.type.toUpperCase()}:\n`;
      output += `  Events: ${parseInt(sensor.event_count).toLocaleString()}\n`;
      output += `  Range: ${sensor.min_value} - ${sensor.max_value}\n`;
      output += `  Average: ${parseFloat(sensor.avg_value).toFixed(2)}\n`;
      output += `  Last Updated: ${new Date(sensor.last_updated).toLocaleString()}\n\n`;
    });
  }
  
  // Health Alerts
  if (alerts.length > 0) {
    output += '🚨 HEALTH ALERTS\n';
    output += '-'.repeat(30) + '\n';
    alerts.forEach(alert => {
      output += `${alert.type}: ${alert.device_id}\n`;
      output += `  Issue: ${alert.issue}\n`;
      output += `  Battery: ${alert.battery_level}%\n`;
      output += `  Updated: ${new Date(alert.last_updated).toLocaleString()}\n\n`;
    });
  } else {
    output += '✅ No critical health alerts\n\n';
  }
  
  // Trends
  if (trends.eventsToday > 0) {
    output += '📊 RECENT TRENDS\n';
    output += '-'.repeat(30) + '\n';
    output += `Events Today: ${trends.eventsToday}\n`;
    output += `Peak Hour: ${trends.peakHour}:00 (${trends.eventsByHour[trends.peakHour]} events)\n\n`;
    
    output += 'Events by Type:\n';
    Object.entries(trends.eventsByType).forEach(([type, count]) => {
      output += `  ${type}: ${count}\n`;
    });
    
    if (Object.keys(trends.manufacturerDistribution).length > 0) {
      output += '\nManufacturer Distribution:\n';
      Object.entries(trends.manufacturerDistribution).forEach(([manufacturer, count]) => {
        output += `  ${manufacturer}: ${count} devices\n`;
      });
    }
  }
  
  return output;
}

/**
 * Format output for JSON
 */
function formatJsonOutput() {
  return JSON.stringify(analyticsData, null, 2);
}

/**
 * Format output for Markdown
 */
function formatMarkdownOutput() {
  const { summary, sensorStats, deviceHealth, alerts, trends } = analyticsData;
  
  let output = '';
  
  output += '# IoT Analytics Report\n\n';
  output += `**Generated:** ${new Date(analyticsData.timestamp).toLocaleString()}\n\n`;
  
  // Summary
  output += '## System Summary\n\n';
  output += `| Metric | Value |\n`;
  output += `|--------|-------|\n`;
  output += `| Total Sensor Types | ${summary.totalSensors} |\n`;
  output += `| Total Devices | ${summary.totalDevices} |\n`;
  output += `| Total Events | ${summary.totalEvents.toLocaleString()} |\n`;
  output += `| Recent Events | ${summary.recentEvents} |\n`;
  output += `| Average Battery Level | ${summary.averageBattery.toFixed(1)}% |\n\n`;
  
  // Health Status
  output += '## Device Health Status\n\n';
  output += `- ✅ **Good:** ${summary.healthDistribution.good} devices\n`;
  output += `- ⚠️ **Warning:** ${summary.healthDistribution.warning} devices\n`;
  output += `- 🚨 **Critical:** ${summary.healthDistribution.critical} devices\n\n`;
  
  // Sensor Stats Table
  if (sensorStats.length > 0) {
    output += '## Sensor Statistics\n\n';
    output += `| Type | Events | Min Value | Max Value | Average | Last Updated |\n`;
    output += `|------|--------|-----------|-----------|---------|-------------|\n`;
    sensorStats.forEach(sensor => {
      output += `| ${sensor.type} | ${parseInt(sensor.event_count).toLocaleString()} | ${sensor.min_value} | ${sensor.max_value} | ${parseFloat(sensor.avg_value).toFixed(2)} | ${new Date(sensor.last_updated).toLocaleString()} |\n`;
    });
    output += '\n';
  }
  
  // Alerts
  if (alerts.length > 0) {
    output += '## Health Alerts\n\n';
    alerts.forEach(alert => {
      output += `### ${alert.type}: ${alert.device_id}\n`;
      output += `- **Issue:** ${alert.issue}\n`;
      output += `- **Battery:** ${alert.battery_level}%\n`;
      output += `- **Updated:** ${new Date(alert.last_updated).toLocaleString()}\n\n`;
    });
  } else {
    output += '## Health Alerts\n\n✅ No critical health alerts\n\n';
  }
  
  return output;
}

/**
 * Save report to file
 */
async function saveReport(content, filename) {
  try {
    await fs.writeFile(filename, content, 'utf8');
    console.log(`📄 Report saved to: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to save report: ${error.message}`);
  }
}

/**
 * Main analytics function
 */
async function generateAnalytics() {
  try {
    console.log('🚀 Starting IoT Analytics Generation...');
    
    if (!config.supabaseKey) {
      throw new Error('SUPABASE_ANON_KEY environment variable is required');
    }
    
    // Fetch all required data
    const [sensorStats, deviceHealth, recentEvents] = await Promise.all([
      fetchSensorStats(),
      fetchDeviceHealth(),
      fetchRecentEvents()
    ]);
    
    // Calculate analytics
    const summary = calculateSummary(sensorStats, deviceHealth, recentEvents);
    const alerts = generateHealthAlerts(deviceHealth);
    const trends = analyzeTrends(recentEvents);
    
    // Filter for health alerts only if requested
    if (config.healthAlerts && alerts.length === 0) {
      console.log('✅ No health alerts to display');
      return;
    }
    
    // Generate output
    let output;
    switch (config.format) {
      case 'json':
        output = formatJsonOutput();
        break;
      case 'markdown':
        output = formatMarkdownOutput();
        break;
      default:
        output = formatConsoleOutput();
    }
    
    // Display or save output
    if (config.reportFile) {
      await saveReport(output, config.reportFile);
    } else {
      console.log(output);
    }
    
    console.log('✅ Analytics generation completed successfully!');
    
  } catch (error) {
    console.error('💥 Analytics generation failed:', error.message);
    if (config.verbose) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Display usage information
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📊 IoT Analytics Script - Usage

Description:
  Generate comprehensive analytics and health monitoring reports from IoT sensor data.

Usage:
  node analyze_data.js [options]

Options:
  --report-file=<filename>  Export report to specified file
  --format=<type>          Output format: console (default), json, markdown
  --verbose                Show detailed processing information
  --health-alerts          Display only critical health issues
  --help, -h              Show this help message

Examples:
  node analyze_data.js
  node analyze_data.js --format=json --report-file=report.json
  node analyze_data.js --format=markdown --report-file=report.md --verbose
  node analyze_data.js --health-alerts

Environment Variables:
  SUPABASE_URL      Supabase project URL (required)
  SUPABASE_ANON_KEY Supabase anonymous API key (required)
`);
  process.exit(0);
}

// Run analytics
generateAnalytics();