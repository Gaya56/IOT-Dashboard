---
mode: agent
---
Define the task to achieve, including specific requirements, constraints, and success criteria.
## Objective
Correct data realism and consistency issues in the IoT Dashboard database, then validate fixes and generate a short summary report.

## Tools to use
- `supabase` MCP server (for SQL updates and validation queries)  
- `filesystem` (to save updated reports)  
- `sequentialthinking` (to plan/track steps)  
- `memory` (store analysis and results)  
- `brave-search` (only for official documentation on gas/vibration sensor expected ranges)

## Procedure
1. **Plan** (sequentialthinking): Outline update and validation steps.  
2. **Reference Ranges**: Use `brave-search` with official sensor docs to confirm:
   - Gas sensors: realistic background 10–100 ppm.  
   - Vibration sensors: baseline 0.1–2g.  
   - Industrial temperature tolerance (flag anomaly).  
3. **Data Fixes** (supabase):
   - **Gas Sensors**:  
     ```sql
     UPDATE iot_events 
     SET value = 15 + (RANDOM() * 85) 
     WHERE type = 'gas' AND value::numeric = 0;
     ```
   - **Vibration Sensors**:  
     ```sql
     UPDATE iot_events 
     SET value = 0.1 + (RANDOM() * 1.9) 
     WHERE type = 'vibration' AND value::numeric = 0;
     ```
   - **Temperature Anomaly**:  
     ```sql
     UPDATE iot_events 
     SET status = 'sensor_error'
     WHERE type = 'temperature' AND value::numeric < -20;
     ```
   - **Device IDs**: Normalize inconsistent IDs into `device_{type}_{seq}` format (update in `devices` table).  
4. **Validation Test**:
   - Count updated rows for gas/vibration.  
   - Confirm no remaining `0` values in these sensors.  
   - Verify anomaly flag applied.  
   - Confirm all device IDs follow new pattern.  
5. **Reports**:
   - Save machine-readable results to `_reports/fix_validation.json`.  
   - Save human-readable summary to `_reports/fix_summary.md`.  

## Deliverables
- **Validation Outputs**: row counts, sample fixed values.  
- **Updated Reports** (`fix_validation.json`, `fix_summary.md`).  
- **Short Summary (≤150 words)** of fixes applied and test results.  

## Success Criteria
- Gas and vibration sensor values corrected to realistic ranges.  
- Temperature anomaly properly flagged.  
- Device IDs standardized.  
- Validation confirms no critical issues remain.  
- Concise summary generated.
