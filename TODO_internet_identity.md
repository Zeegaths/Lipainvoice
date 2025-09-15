## TODO: Implement Internet Identity Login

### Current State Analysis
- App.tsx uses `useInternetIdentity` from 'ic-use-internet-identity'
- useActor.ts uses `useInternetIdentity` from 'ic-use-internet-identity'
- main.tsx wraps app with NFID IdentityKitProvider
- LoginScreen.tsx uses NFID's useAuth hook
- There's a conflict between NFID and Internet Identity implementations

### Plan
1. **Update main.tsx**: Replace NFID IdentityKitProvider with InternetIdentityProvider from ic-use-internet-identity
2. **Update LoginScreen.tsx**: Replace NFID useAuth with Internet Identity login logic
3. **Test Integration**: Ensure login works and actor creation succeeds
4. **Remove NFID dependencies**: Clean up unused NFID packages if no longer needed

### Files to Modify
- src/lipa_frontend/src/main.tsx
- src/lipa_frontend/src/components/LoginScreen.tsx

### Dependencies
- ic-use-internet-identity: ^0.4.0 (already installed)
- @dfinity/auth-client: ^2.4.1 (already installed)
