````prompt
---
mode: agent
---

# Step 8: Dashboard Development

## 📋 Project Overview

Implement Step 8: Dashboard Development for the IoT Dashboard project. After completing analytics and health monitoring in Step 7, the next phase is to build a simple yet powerful front-end that visualizes the aggregated metrics stored in the database. The dashboard should provide immediate insights into device status and sensor statistics, support real-time updates, and lay the groundwork for future enhancements such as advanced charts and AI-powered insights.

---

## 🎯 Specific Requirements

### Framework & Structure

Use a JavaScript front-end framework (React with Vite or Next.js is preferred, but a simple vanilla JS setup is acceptable). The front-end should reside in a `dashboard` directory within the repository.

Initialize the project with a sensible directory structure (e.g. `src/components`, `src/pages`, `src/hooks`). Include a `package.json` with necessary dependencies (e.g. react, supabase-js, chart.js for charts, tailwindcss for styling).

Provide clear instructions in the README for installing dependencies (`npm install`) and starting the development server (`npm run dev`). Include a note on building the production bundle (`npm run build` or equivalent) for static deployment.

### Supabase Connection

Use the supabase-js client to connect to the Supabase project. Create a helper module (e.g. `supabaseClient.js`) that reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from environment variables (via Vite `.env` or Next.js environment configuration).

Implement functions to fetch data from the `sensor_stats` and `device_health` summary tables. Use the `.from('table').select()` API to query aggregated metrics. Optionally, provide filtering or pagination.

Implement a Realtime subscription to the `iot_events` or summary tables so the dashboard updates automatically when new events arrive. Supabase triggers ensure the summary tables are updated automatically.

### Dashboard Features

**Summary Cards**: Create UI components that display key metrics such as total devices, number of events per sensor type, and counts of devices by health status (good, warning, critical). These should read directly from the summary tables.

**Charts**: Use a chart library (e.g. chart.js) to render bar or line charts showing trends such as event counts over time, average temperature over the past day, or battery distribution. Data can be derived from either the summary tables or the analytics script output.

**Device Table**: Build a table or list that displays each device along with its latest battery level, last calibration date, manufacturer and health status. Include sorting and filtering by health status.

**Realtime Updates**: When the database changes (e.g. new events inserted), update the dashboard components in real-time. This should use Supabase's realtime subscriptions or channel API. Document any event channels used.

### Configuration & Environment

Provide a `.env.example` file in the dashboard directory with placeholders for `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Document how to create a `.env.local` (or `.env`) file when running locally.

Use environment variables for any API keys. Do not hard-code secrets in code.

### Documentation

Update the root `README.md` with a new "Dashboard" section describing how to set up, run, and use the dashboard. Include screenshots or example commands if helpful. Mention that the dashboard leverages the summary tables and analytics infrastructure built in previous steps.

If using a complex framework like Next.js, add a `dashboard/README.md` explaining the file structure and key scripts.

### Deployment & Hosting on Supabase

After building the dashboard for production (`npm run build`), create a `dist` or `build` directory containing static files (HTML, CSS, JS and assets).

Use the Supabase CLI to host the dashboard directly on your Supabase project. Supabase provides a powerful static-site hosting solution for your websites. Initialize the project if necessary (`supabase init`) and configure a `supabase.json` with a public bucket.

Upload the built files to the designated bucket via the CLI or a simple deployment script. Once deployed, your site will be served via Supabase's CDN, and it will integrate seamlessly with the rest of the stack.

Update the README with deployment instructions, including how to set up the Supabase CLI, where to find the hosted URL, and any steps for refreshing or redeploying when the dashboard changes.

### Testing & Verification

Verify that the dashboard displays data correctly using sample entries in the database. When new events are simulated and inserted into `iot_events`, ensure that the UI refreshes to reflect updated counts and health statuses.

If possible, include a simple unit test or integration test (e.g. using jest or vitest) that mocks the Supabase client and ensures the data-fetching functions work.

---

## 🚧 Constraints

**Non-breaking Changes**: The dashboard should be an addition to the repository, not a replacement of existing components. Do not delete or modify the analytics script, simulation script, or instructions.

**Portability**: The dashboard must run locally without requiring additional backend changes. Use only the Supabase REST API and client libraries.

**Security**: Do not expose your Supabase service key. Use only the anon key and ensure row level security policies permit the required reads.

**Licensing**: Use only open-source libraries compatible with MIT or Apache licenses.

**Deployment**: The dashboard should be hosted on Supabase's static site hosting service. Use the Supabase CLI to upload the built assets to a public bucket and serve them via Supabase's CDN. Other hosting solutions (e.g. Vercel or Netlify) are optional and may be documented for comparison, but Supabase hosting is preferred.

---

## ✅ Success Criteria

- [ ] A `dashboard` directory exists with a working front-end application. Running `npm install` and `npm run dev` starts a local server that displays the dashboard UI.

- [ ] The dashboard connects to Supabase using the provided environment variables and fetches data from `sensor_stats` and `device_health` tables.

- [ ] Key metrics (total devices, counts per sensor type, health distribution) are displayed in summary cards.

- [ ] Charts and tables render correctly and update automatically when new events are inserted.

- [ ] Documentation has been updated to include dashboard setup instructions, deployment via Supabase hosting, and usage examples.

---

## 🔧 Technical Specifications

### Required Dependencies
- React with Vite (preferred) or Next.js
- supabase-js for database connection
- chart.js or similar for data visualization
- tailwindcss for styling
- Environment variable support

### Database Integration
- Connect to existing `sensor_stats` and `device_health` summary tables
- Implement real-time subscriptions for live updates
- Use existing analytics infrastructure from Step 7

### UI Components Required
- Summary cards for key metrics
- Charts for trend visualization
- Device table with sorting and filtering
- Real-time update indicators

### Deployment Target
- Supabase static site hosting
- CDN-served assets
- Integration with existing Supabase infrastructure
````