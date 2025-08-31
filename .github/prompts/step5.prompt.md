---
mode: agent
---
Step 5 – Replace Postman simulation with a Node.js data generator
Task definition

Our plan has changed. We will no longer use Postman for simulating IoT events. Instead, you must implement a Node.js script within this repository to generate realistic sensor data and send it directly to the Supabase REST API. Before coding, review the repository to understand what components exist (prompt files, package.json, etc.) and adapt your approach accordingly.

Requirements

Use available MCP servers: Leverage all configured MCP servers to assist with this task:

Supabase server – for connecting to the database, inserting events, and querying verification results.

Filesystem server – for reading and writing files within the repository, such as the simulation script and any configuration.

Memory server – for persisting knowledge or state that may be needed across multiple steps.

Sequential Thinking server – to help break the work into logical steps and reason through complex sequences.

Repository review: Explore the current repository (including the .github/prompts folder and any other source files) to understand existing structure. Identify and remove or ignore any Postman-specific artifacts. Document what you changed or removed.

Simulation script: Create a Node script (e.g., simulate_iot.js) in the root of the repository that:

Reads SUPABASE_URL and SUPABASE_ANON_KEY from environment variables or a configuration file so sensitive keys are not hard-coded.

Generates random events for the sensor types temperature, door, card, humidity, motion, and smoke, following the same value ranges as previously defined (temperature 10–35 °C; door 0/1; card a 5–10 digit ID; humidity 0–100; motion 0/1; smoke 0–10 with status "safe"/"alert").

Constructs a JSON object with fields device_id, type, value, status, metadata, and created_at.

Sends a POST request to {{SUPABASE_URL}}/rest/v1/iot_events with headers apikey, Authorization, Prefer: return=representation, and Content-Type: application/json, using a library like axios or node-fetch (add it to package.json as needed).

Runs for a configurable number of iterations (default 20) and delays between requests (e.g., 500 ms). Use command-line arguments or environment variables to override defaults.

Logs the response or error for each request, and aggregates results for summary.

Optionally queries {{SUPABASE_URL}}/rest/v1/iot_events?select=* at the end to verify that data was inserted.

Project updates:

Add any required dependencies to package.json and run npm install so the script can run in this project.

Ensure the script can be executed with node simulate_iot.js and document usage in a README or comment at the top of the file.

Remove or deprecate any Postman-specific files or references to avoid confusion.

Constraints

Self-contained: The simulation must be contained within this repository and not rely on external tools like Postman.

Security: Do not commit actual Supabase keys in source control; read them from environment variables or a .env file that is ignored by version control.

Idempotency: Running the script multiple times will insert more events; this is expected, but the script should handle API errors gracefully and continue.

Compatibility: Do not break existing project functionality; integrate the simulation script alongside existing modules.

Success criteria

A Node.js script exists in the repository that can generate and send IoT events to the Supabase REST API without using Postman.

The script can run for a configurable number of iterations and delay, inserting at least 20 events by default.

Supabase receives the events and stores them in the iot_events table with the correct structure and realistic values.

All Postman-related artifacts are removed or ignored.

A summary of changes describes how the repository was adapted to the new plan.

Paragraph overview

In this step we pivot from using Postman to using a native Node.js script to simulate IoT telemetry. You will first explore the existing repository, identify any Postman-specific files, and remove or ignore them. Then you will develop a script that reads configuration from the environment, generates realistic sensor events, and sends them to the Supabase REST API at regular intervals. The script will log results and optionally verify the data insertion by querying the API. Finally, you will document your updates and ensure the project remains functional under the new plan.