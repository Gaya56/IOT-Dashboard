---
mode: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.Step 2 – Create the iot_events table in Supabase
Task definition

You are an MCP agent tasked with provisioning the database layer for our IoT dashboard project. Specifically, you must create a new table called iot_events in our Supabase instance using the Supabase MCP tooling. The table will store readings from a variety of simulated IoT devices. After creating the table, you must enable row level security (RLS) so that the data API remains protected until policies are applied. This prompt defines the requirements, constraints, and success criteria for the task.

Requirements

Table structure: Create a table named iot_events in the public schema. The table must have the following columns:

id – A primary key column using bigint with generated always as identity to auto‑increment IDs. Use Supabase’s recommended pattern for identity columns
supabase.com
.

device_id – Text field that identifies the source device (required).

type – Text field constrained by a check so that only the following values are allowed: 'temperature', 'door', 'card', 'humidity', 'motion', 'smoke'.

value – Numeric column for sensor readings.

status – Text column for optional device status.

metadata – JSONB column for any structured meta‑information.

created_at – timestamptz column defaulting to now().

Enable RLS: Immediately after creating the table, run ALTER TABLE public.iot_events ENABLE ROW LEVEL SECURITY; to enforce Supabase’s security model
supabase.com
.

Tools: Use the Supabase MCP tools to connect to the project using the provided configuration, and the file system API to record and recall state if needed. Utilize sequential reasoning to verify each command executes successfully. Use memory to ensure you don’t duplicate work.

Dynamic behaviour: While this step only creates the table, it prepares for later dynamic data injection by including the created_at timestamp and flexible metadata JSONB field. Do not insert any data in this step.

Constraints

No side effects beyond table creation: Do not insert records or modify other tables. Only create iot_events and enable RLS.

Lowercase names: All identifiers (iot_events, device_id, etc.) must be lowercase with underscores as recommended in our database standards.

Idempotent execution: If the table already exists, your solution must detect this and skip the creation step to avoid errors. You may use CREATE TABLE IF NOT EXISTS or a similar guard.

Check enforcement: Ensure the type column’s check constraint exactly matches the list of allowed sensor types.

Triple check: After executing the creation and enabling RLS, retrieve the table definition (for example, via a psql \d+ public.iot_events query or using the Supabase GUI) to confirm columns and constraints are correct, then report your findings. If something is missing or incorrect, adjust and retry until it matches the spec.

Success criteria

The task is complete when:

The iot_events table exists in the public schema with the columns and constraints defined above. The id column is auto‑incrementing.

Row level security is enabled on the table, meaning the relrowsecurity property is set to enabled.

You have verified the table structure by querying the database schema and documented the result.

You have produced a concise checklist and overview summarising what was done and the outcomes of the verification steps.

Paragraph overview

In this step we lay the foundation for storing IoT device telemetry. You will use Supabase’s MCP tooling to create a new table called iot_events with fields for the device ID, event type, reading value, status, metadata, and a timestamp. The table uses an auto‑incrementing integer primary key and enforces a check on the type column to restrict it to a finite set of sensor categories. After creation, you will enable row level security to adhere to Supabase’s data access model. No data is inserted at this stage; the goal is to ensure the structure is correct and ready for dynamic data ingestion in subsequent steps. Finally, you must verify the table definition and report back with a checklist and overview of your actions.