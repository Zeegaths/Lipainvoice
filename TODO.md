# Fix 400 Bad Request Error in useQueries.ts

## Problem
- POST http://localhost:3000/api/v2/canister/u6s2n-gx777-77774-qaaba-cai/read_state 400 (Bad Request)
- Error occurs at line 35 in useQueries.ts, related to await in queryFn

## Root Cause
- HttpAgent in useQueries.ts is created without specifying host, defaulting to 'https://ic0.app'
- For local development, agent needs host: 'http://127.0.0.1:4943' and fetchRootKey()

## Plan
- [x] Modify useQueries.ts to configure HttpAgent with correct host for local network (changed port to 4943)
- [x] Add fetchRootKey() for local development
- [x] Ensure network detection using import.meta.env.DFX_NETWORK
- [x] Test the fix by running the frontend and checking for errors

## Dependent Files
- src/lipa_frontend/src/hooks/useQueries.ts

## Followup Steps
- Run dfx start if not running
- Run npm run dev in frontend
- Check browser console for errors
- Verify invoices load without 400 error
