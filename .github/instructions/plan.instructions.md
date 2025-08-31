---
applyTo: '**/home/ali/Documents/IOT-Dashboards'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.Awesome—here’s the battle plan (with official docs), then we’ll go step-by-step with ≤150-word instructions and screenshot checks.

# Plan (overview)

1. **Create Supabase project + get API URL & keys** (Settings → API). ([Supabase][1])
2. **Create schema** (UI Table Editor or SQL). Keep names lowercase\_with\_underscores. ([Supabase][2])
3. **Enable RLS + temporary test policies**, then tighten later. ([Supabase][3])
4. **(Optional) Realtime** for live monitoring. ([Supabase][4])
5. **Postman setup**: environment variables for URL/keys; collection with POST (insert) + GET (verify). ([Postman Docs][5], [Supabase][6])
6. **Simulate traffic** with the **Collection Runner** (iterations/delay). ([Postman Docs][7])
7. **Later**: simple alerting (SQL trigger or edge function).

---

## Step 1 — Supabase project & keys (≤150 words)

1. Go to **app.supabase.com → New project**.
2. After it’s ready: **Settings → API**. Copy:

   * **Project URL** (base)
   * **anon** key (public)

We’ll use:

* `{{SUPABASE_URL}} = <Project URL>`
* `{{SUPABASE_ANON_KEY}} = <anon key>`

Keep this tab open. ([Supabase][1])

**Send me a screenshot** of **Settings → API** showing the URL and anon key (you can blur the key). I’ll give Step 2 next.

---

### (Preview: table + policies you’ll paste next)

**SQL** (don’t run yet):

```sql
create table public.iot_events (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  type text check (type in ('temperature','door','card','humidity','motion','smoke')),
  value numeric,
  status text,
  metadata jsonb,
  created_at timestamptz default now()
);
alter table public.iot_events enable row level security;
create policy "allow_anon_insert_temp" on public.iot_events for insert to anon with check (true);
create policy "allow_anon_select_temp" on public.iot_events for select to anon using (true);
```

([Supabase][2])

I’ll wait for your screenshot to proceed.

[1]: https://supabase.com/docs/guides/api/creating-routes?utm_source=chatgpt.com "Creating API Routes | Supabase Docs"
[2]: https://supabase.com/docs/guides/database/tables?utm_source=chatgpt.com "Tables and Data | Supabase Docs"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
[4]: https://supabase.com/docs/guides/realtime/postgres-changes?utm_source=chatgpt.com "Postgres Changes | Supabase Docs"
[5]: https://learning.postman.com/docs/sending-requests/variables/environment-variables/?utm_source=chatgpt.com "Edit and set environment variables in Postman"
[6]: https://supabase.com/docs/guides/api?utm_source=chatgpt.com "REST API | Supabase Docs"
[7]: https://learning.postman.com/docs/collections/running-collections/intro-to-collection-runs/?utm_source=chatgpt.com "Test your API using the Collection Runner"


Here’s the official‑doc–backed plan:

1. **Create project & copy API keys.** In the Supabase dashboard, open **Settings → API** and note the **Project URL** and **anon key**. Supabase docs explain the difference between `anon` and secret keys, and remind that RLS must be enabled to protect data.
2. **Create an `iot_events` table.** Use the SQL editor to run a statement like `CREATE TABLE public.iot_events (...) GENERATED ALWAYS AS IDENTITY PRIMARY KEY;` for your sensor data.
3. **Enable Row‑Level Security (RLS).** After creating the table, run `ALTER TABLE public.iot_events ENABLE ROW LEVEL SECURITY;`—Supabase notes that data isn’t accessible via the API until policies are defined.
4. **Write permissive policies for testing.** Create simple `anon` policies for INSERT and SELECT so the Postman script can write and read data.
5. **Set up a Postman environment.** In Postman’s sidebar, go to **Environments**, click the **Add** icon, name it, then add variables like `SUPABASE_URL` and `SUPABASE_ANON_KEY`; save and select the environment.
6. **Create POST & GET requests.** Use the environment variables in your request URL (`{{SUPABASE_URL}}/rest/v1/iot_events`) and headers (e.g., `apikey: {{SUPABASE_ANON_KEY}}`).
7. **Run simulations.** Use the Collection Runner to iterate through your requests; you can set an iteration count and delay between runs (e.g., 5 ms).

Please start with Step 1. Send me a screenshot showing your Supabase **Settings → API** page (you may blur the key), and I’ll give detailed Step 2 instructions.
