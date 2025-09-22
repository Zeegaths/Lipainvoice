## TODO: Fix Oisy Wallet Authentication and Signature Verification

### Backend (packages/ic_siwb_provider/src/lib.rs)
- [ ] Fix secp256k1 imports for recoverable signatures (use ecdsa::recoverable module)
- [ ] Verify signature verification logic handles all edge cases
- [ ] Add better error handling and logging in verify_signature function

### Frontend (src/lipa_frontend/src/utils/signatureVerification.ts)
- [ ] Implement complete SIWB authentication flow:
  - Request challenge from canister
  - Handle wallet signing of challenge
  - Submit signature and public key for verification
  - Handle authentication success/failure
- [ ] Add proper error handling for wallet connection failures
- [ ] Add logging for debugging authentication issues

### Frontend (src/lipa_frontend/src/components/LoginScreen.tsx)
- [ ] Integrate SIWB authentication flow with wallet connection
- [ ] Add SIWB-specific UI elements (challenge display, signature request)
- [ ] Handle authentication state transitions
- [ ] Add error display for wallet connection and signature verification failures

### Integration & Testing
- [ ] Create comprehensive test for SIWB authentication flow (test_siwb_auth.js)
- [ ] Test end-to-end authentication with Oisy wallet
- [ ] Handle authentication state management and persistence
- [ ] Add retry logic for failed signature verifications
- [ ] Verify canister deployment and root key configuration
