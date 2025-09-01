// Database connection utility for IoT simulation
// Handles Supabase client initialization and device registry access

const axios = require('axios');
require('dotenv').config();

class DatabaseClient {
    constructor() {
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        if (!this.supabaseUrl || !this.supabaseKey) {
            throw new Error('Missing Supabase credentials. Please check your .env file.');
        }
        
        this.headers = {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    // Get all devices from the registry
    async getAllDevices() {
        try {
            // Try the new enhanced schema first
            const response = await axios.get(
                `${this.supabaseUrl}/rest/v1/devices?select=*,device_types(*),locations(*),manufacturers(*)`,
                { headers: this.headers }
            );
            return response.data.map(device => ({
                device_id: device.device_id,
                type_name: device.device_types?.type_name || 'unknown',
                device_name: device.device_name,
                location_name: device.locations?.name || 'Unknown Location',
                manufacturer_name: device.manufacturers?.name || 'Unknown Manufacturer',
                battery_level: device.battery_level,
                sensor_range: device.device_types?.sensor_range || 'N/A',
                unit: device.device_types?.unit || 'N/A',
                metadata: device.metadata || {}
            }));
        } catch (error) {
            console.warn('Enhanced device registry not available, using fallback mode');
            // Return empty array for now - simulation will generate fallback devices
            return [];
        }
    }

    // Get devices by type
    async getDevicesByType(deviceType) {
        try {
            const response = await axios.get(
                `${this.supabaseUrl}/rest/v1/devices?select=*,device_types(*),locations(*),manufacturers(*)&device_types.type_name=eq.${deviceType}`,
                { headers: this.headers }
            );
            return response.data.map(device => ({
                device_id: device.device_id,
                type_name: device.device_types?.type_name || deviceType,
                device_name: device.device_name,
                location_name: device.locations?.name || 'Unknown Location',
                manufacturer_name: device.manufacturers?.name || 'Unknown Manufacturer',
                battery_level: device.battery_level,
                sensor_range: device.device_types?.sensor_range || 'N/A',
                unit: device.device_types?.unit || 'N/A',
                metadata: device.metadata || {}
            }));
        } catch (error) {
            console.warn(`Enhanced device registry not available for ${deviceType}, using fallback mode`);
            return [];
        }
    }

    // Get random device of specific type
    async getRandomDevice(deviceType = null) {
        try {
            let devices;
            if (deviceType) {
                devices = await this.getDevicesByType(deviceType);
            } else {
                devices = await this.getAllDevices();
            }
            
            if (devices.length === 0) {
                throw new Error(`No devices found${deviceType ? ` for type: ${deviceType}` : ''}`);
            }
            
            return devices[Math.floor(Math.random() * devices.length)];
        } catch (error) {
            console.error('Error getting random device:', error.message);
            throw error;
        }
    }

    // Insert IoT event
    async insertEvent(eventData) {
        try {
            const response = await axios.post(
                `${this.supabaseUrl}/rest/v1/iot_events`,
                eventData,
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error inserting event:', error.message);
            throw error;
        }
    }

    // Update device battery level
    async updateDeviceBattery(deviceId, newBatteryLevel) {
        try {
            const response = await axios.patch(
                `${this.supabaseUrl}/rest/v1/devices?device_id=eq.${deviceId}`,
                { battery_level: newBatteryLevel },
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating device battery:', error.message);
        }
    }

    // Insert pattern event (anomaly detection)
    async insertPatternEvent(patternData) {
        try {
            // First get device ID from device_id string
            const deviceResponse = await axios.get(
                `${this.supabaseUrl}/rest/v1/devices?select=id&device_id=eq.${patternData.device_id}`,
                { headers: this.headers }
            );
            
            if (deviceResponse.data.length === 0) {
                throw new Error(`Device not found: ${patternData.device_id}`);
            }
            
            const deviceIdNum = deviceResponse.data[0].id;
            const eventData = {
                ...patternData,
                device_id: deviceIdNum
            };
            
            const response = await axios.post(
                `${this.supabaseUrl}/rest/v1/pattern_events`,
                eventData,
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            console.error('Error inserting pattern event:', error.message);
            throw error;
        }
    }

    // Check connection by testing against the iot_events table (which we know exists)
    async testConnection() {
        try {
            const response = await axios.get(
                `${this.supabaseUrl}/rest/v1/iot_events?select=count&limit=1`,
                { headers: this.headers }
            );
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error.message);
            return false;
        }
    }
}

module.exports = DatabaseClient;