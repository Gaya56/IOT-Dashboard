---
mode: agent
---
## Objective
Install and test the Supabase CLI for `/home/ali/Documents/IOT-Dashboards`.  
Always reference and follow:  
- Local copy: `/home/ali/Documents/IOT-Dashboards/docs/supabase_cli_getting_started.MD`  
- Official docs: https://supabase.com/docs/guides/local-development/cli/getting-started  
- Any other official Supabase resources found via brave-search  

## Tools
- sequentialthinking, filesystem, memory, supabase, brave-search

## Steps
1. Read local CLI doc for baseline instructions.  
2. Use brave-search to open and follow the official Supabase CLI docs (and any linked pages).  
3. Run commands exactly as documented:  
   - `npx supabase --help`  
   - `supabase init`  
   - `supabase start` (ensure Docker is running)  
4. Load env from `/home/ali/Documents/IOT-Dashboards/.env` (never print secrets).  
5. Test DB connection (supabase MCP):  
   - `select now();`  
   - Insert + read back 1 row in `iot_events`.  
6. Save results in `/home/ali/Documents/IOT-Dashboards/_reports`:  
   - `cli_setup.json` (CLI version + URLs)  
   - `cli_test.json` (query + insert results)  
   - `cli_summary.md` (short human summary with doc references)  

## Success
- CLI installs and runs exactly per Supabase docs  
- DB connection + test insert verified  
- Reports generated with explicit references to official documentation
