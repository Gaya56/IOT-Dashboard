---
mode: agent
---
Step 6 – Enhance device metadata for dashboards and AI
Task definition

We want to enrich the IoT simulation data with additional device‑level details so that future dashboards and AI analysis can provide deeper insights (e.g., system health, location, battery status). You will update the Node.js simulation script to include more metadata about each device while keeping the workflow simple. Use all available MCP servers—Supabase, Filesystem, Memory, and Sequential Thinking—to perform the necessary updates and verify the results.

Requirements

Repository review: Examine the current project structure and Node simulation (simulate_iot.js) to understand how events are generated and inserted into Supabase. Identify where to modify or extend the code to include richer device metadata.

Metadata enrichment: Modify simulate_iot.js (or create a separate module) to augment each event with additional metadata fields. At minimum, include:

device_name – a human‑friendly name derived from the device ID (e.g., "Temperature Sensor 001").

location – a realistic room or zone identifier (choose from a predefined list).

battery_level – a numeric percentage (0–100) representing current battery charge.

last_calibration – an ISO date string representing a recent calibration date (e.g., within the past year).

manufacturer – a random manufacturer name from a small list (e.g., Acme Sensors, IoTCo).

system_health – a status indicator such as "good", "warning", or "critical" based on thresholds (e.g., low battery).
These should be bundled into the existing metadata JSON field when posting events to Supabase. Do not modify the iot_events table schema unless necessary; storing these fields in metadata keeps the table flexible.

Device registry (optional): For clarity, consider maintaining a separate in‑memory map or a small JSON file of device details (id → metadata) so that subsequent events for the same device use consistent metadata (e.g., fixed location and manufacturer). Use the memory server to cache this map.

Script configurability: Ensure that metadata generation can be turned on or off via a command‑line flag (e.g., --enrich-metadata). Default should be enabled.

Documentation updates: Update the README and instructions to describe the new metadata fields and how to interpret them. If a .env.example file exists, include any new environment variables if needed (though this step should not require new environment variables).

Testing and verification: Run the updated simulation and confirm that the iot_events table now contains events with the enriched metadata. Use the Supabase server to query the table and display sample entries. Check that battery levels are within 0–100, calibration dates are recent, and system_health values reflect battery levels (e.g., below 20% → "warning").

Use MCP servers: Throughout this work, leverage:

Supabase server for inserting and querying data.

Filesystem server for reading/writing project files.

Memory server for caching device details.

Sequential Thinking server to plan out the modifications and execution steps.

Constraints

Backward compatibility: The updated script must still work for the existing simulation without breaking current functionality.

Realism: Generated metadata must be plausible (no negative battery, calibration dates must be within the last 12 months, etc.).

Simplicity: Do not introduce complex database schema changes. Use the existing metadata JSON column instead of adding new columns or tables.

Security: Do not include sensitive or personally identifiable information in metadata.

Success criteria

simulate_iot.js or equivalent script is updated to include enriched metadata in the metadata field for each event.

A configurable flag controls metadata enrichment.

Documentation (README and instructions) has been updated to reflect the enriched data.

The script runs successfully, inserting events with metadata into Supabase and verifying that values meet the specified criteria.

A summary report lists sample enriched events and confirms that battery, calibration, and health fields are present.

Paragraph overview

In this step, you will enhance the existing Node.js IoT simulation to include richer device information for use in dashboards and future AI analysis. By adding fields such as device name, location, battery level, last calibration date, manufacturer, and system health to each event’s metadata, our dataset becomes more informative. You’ll modify the simulation script, test the changes, update documentation, and verify that enriched events appear in the iot_events table. Leveraging Supabase, Filesystem, Memory, and Sequential Thinking servers ensures you have full support for database operations, file management, state caching, and planning.