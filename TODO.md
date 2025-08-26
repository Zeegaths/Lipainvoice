# Bitcoin Address Generation Implementation

## Steps to Complete:

### Phase 1: Setup and Dependencies
- [x] Add Bitcoin libraries to frontend package.json
- [x] Install dependencies
- [x] Create Bitcoin service for address generation

### Phase 2: Backend Updates
- [x] Create Bitcoin utilities module in Motoko
- [ ] Update main.mo to handle Bitcoin addresses
- [ ] Add address storage and validation

### Phase 3: Frontend Implementation
- [ ] Update InvoiceCreation.tsx to generate unique addresses
- [ ] Add Bitcoin address validation
- [ ] Update payment portal to handle generated addresses

### Phase 4: Security & Testing
- [ ] Implement proper key derivation
- [ ] Add address reuse prevention
- [ ] Test with Bitcoin testnet

## Technical Details:
- Address Format: Native SegWit (bech32) - bc1q...
- Library: bitcoinjs-lib + bip39
- Security: HD wallet with proper derivation paths
- Storage: Backend address-invoice mapping

## Files to Create/Modify:
- src/lipa_frontend/package.json (add dependencies) ✓
- src/lipa_frontend/src/services/bitcoinService.ts (new) ✓
- src/lipa_backend/bitcoin.mo (new) ✓
- src/lipa_backend/main.mo (modify)
- src/lipa_frontend/src/pages/InvoiceCreation.tsx (modify)
- src/lipa_frontend/src/hooks/useQueries.ts (modify)
