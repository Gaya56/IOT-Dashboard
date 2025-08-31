---
mode: agent
---
Step 4 – Simulate IoT events with Postman
Task definition

You are an MCP agent tasked with building a dynamic IoT simulation using Postman to send realistic sensor data into our Supabase backend. Use all available MCP servers—Postman API HTTP Server, Supabase Server, Filesystem Server, Memory Server, and Sequential Thinking—to configure the environment, generate data, run the simulation, and verify results. The mock data must closely resemble readings from six types of devices: temperature sensors, door switches, card scanners, humidity sensors, motion detectors, and smoke detectors.

Requirements

Environment setup: Create (or update) a Postman environment with the variables:

SUPABASE_URL – our project’s base URL (e.g., https://<project_ref>.supabase.co).

SUPABASE_ANON_KEY – our anonymous API key.
These variables allow you to reference the URL and key throughout requests via {{variable_name}}, simplifying updates
learning.postman.com
.

Collection configuration: Build a Postman collection containing two requests:

POST to /rest/v1/iot_events – inserts a new event. Use the URL {{SUPABASE_URL}}/rest/v1/iot_events and include headers:

apikey: {{SUPABASE_ANON_KEY}}

Authorization: Bearer {{SUPABASE_ANON_KEY}}

Prefer: return=representation

Content-Type: application/json
The request body should be a JSON object built from variables generated in a pre‑request script.

GET to /rest/v1/iot_events?select=* – retrieves events after insertion to confirm that data was stored.

Dynamic data generation: Write a pre‑request script for the POST request that:

Randomly chooses one of the six sensor types (temperature, door, card, humidity, motion, smoke).

Generates a device_id such as device_{{random}} with a random numeric suffix.

Produces realistic sensor values:

Temperature: numeric value between 10 and 35 (°C).

Door: value of 1 for “open” and 0 for “closed”; optionally set status to "open" or "closed".

Card: assign a random 5–10 digit number as value to simulate a card swipe.

Humidity: percentage between 0 and 100.

Motion: value of 1 if motion is detected, 0 if not; set status accordingly (e.g., "motion" or "still").

Smoke: value (e.g., 0–10) representing smoke density; set status to "safe" for low values and "alert" for high values.

Constructs a metadata object with additional details (e.g., {"location": "lab A"}) as needed.

Assigns these values to variables using pm.variables.set() and constructs the JSON body accordingly. Use double braces ({{ }}) in the request body to reference these variables
learning.postman.com
.

Collection Runner: Use the Postman API HTTP Server to run the collection multiple times. Configure at least 20 iterations with a delay between requests (e.g., 500 ms) using the Runner’s Iterations and Delay settings
learning.postman.com
. This will mimic ongoing IoT traffic.

Verification: After the run, use the Supabase Server to query iot_events and confirm that:

At least 20 new rows were inserted.

Each sensor type appears at least once.

Recorded values fall within the realistic ranges specified above.
Summarise the results, perhaps in a table showing sample entries.

Constraints

Authentication: All Supabase requests must include the anon key in both apikey and Authorization headers.

Realistic data: Ensure values stay within plausible ranges; humidity cannot exceed 100, temperature should not be negative, etc.

Idempotency: Reuse or update existing Postman environments and collections if they exist; do not create duplicates.

Configurability: Allow the number of iterations and delay to be adjusted via variables or parameters; default to 20 iterations and 500 ms delay.

Sequential execution: Use sequential thinking to perform environment setup, collection creation, data generation, run, and verification in order.

Testing: Test your scripts locally within Postman before running at scale to ensure the dynamic values are correctly generated and inserted.

Success criteria

A Postman environment with SUPABASE_URL and SUPABASE_ANON_KEY variables is saved.

A Postman collection exists with the POST and GET requests configured as specified.

Pre‑request scripts generate accurate mock data for each sensor type and insert it into Supabase.

Running the collection results in at least 20 new rows in iot_events, with valid data in the expected ranges.

Verification via Supabase shows that all six sensor types are present and values are realistic.

A concise report summarises the run, including counts per sensor type, sample values, and any issues found and resolved.

Paragraph overview

This step automates the generation of IoT telemetry using Postman. By configuring a Postman environment and collection, you will insert realistic events into Supabase for six different sensors. Pre‑request scripts will produce device IDs, types, values, statuses, and metadata tailored to each sensor category. Running the collection repeatedly with a delay simulates a continuous stream of IoT data, while the Supabase Server verifies that the records were saved correctly. At the end, you will provide a summary of the results and confirm that the simulation behaves as expected.