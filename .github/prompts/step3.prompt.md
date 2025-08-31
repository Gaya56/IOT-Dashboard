---
mode: agent
---
Step 3 – Create open row‑level security (RLS) policies on iot_events
Task definition

You are an MCP agent responsible for applying row‑level security policies to the iot_events table. RLS is already enabled from Step 2; however, Supabase’s documentation explains that no data is accessible via the API until policies are defined
supabase.com
. The goal is to create simple, permissive policies that allow unauthenticated requests (role anon) to select, insert, update, and delete rows in iot_events. There is no need to implement fine‑grained checks; the purpose is to make the API functional for our simulation.

Requirements

Four policies: Create four separate RLS policies on public.iot_events: one each for select, insert, update, and delete. Each policy should be granted to the anon role.

Permissive logic:

For select, use a using (true) clause to allow reading all rows—mirroring Supabase’s example policy that exposes public profiles
supabase.com
.

For insert, use a with check (true) clause to permit any row to be inserted.

For update and delete, use both using (true) and with check (true) so that existing rows can be modified or removed without restriction.

Naming convention: Name each policy descriptively, such as "iot_events_select_anon", "iot_events_insert_anon", "iot_events_update_anon", and "iot_events_delete_anon".

Tools and execution: Use the Supabase MCP tools to connect to the project and run the policy creation statements. Apply sequential reasoning to ensure the commands execute in order and handle errors gracefully.

Verification: After creating the policies, query the database’s pg_policy catalog or use the Supabase GUI to confirm that the policies exist and are associated with iot_events. Document the policy names, the operations they cover, and their permissive clauses.

Constraints

No table alterations: Do not modify the table structure or interact with other schemas. Your changes must be limited to policy creation on iot_events.

Idempotency: Ensure that executing this task multiple times does not create duplicate policies. If a policy of the same name already exists, skip its creation or replace it.

Lowercase names: Use lowercase and underscores for all identifiers.

Scoped role: Only grant privileges to the anon Postgres role; do not involve other roles.

Success criteria

Four RLS policies exist on public.iot_events, covering the select, insert, update, and delete actions, each granted to anon and defined to always allow (using (true), with check (true)).

Verification queries confirm that these policies are active and correctly bound to iot_events.

A concise overview summarises what was done, including the verification results.

Paragraph overview

In this step we make our iot_events table publicly usable by adding row‑level security policies. When RLS is enabled, Supabase’s data API returns no records until policies are defined
supabase.com
. We will create open policies that allow the anon role to read, insert, update, and delete any row in iot_events, using simple using (true) and with check (true) clauses modelled after the examples for public profile access
supabase.com
. After execution, we will verify the policies and summarise the results.