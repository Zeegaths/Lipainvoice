# TODO for Lightning Invoicing Implementation

## Backend (src/lipa_backend/main.mo)
- [ ] Add LightningInvoice type with fields: invoice string, status, amount, expiry.
- [ ] Add stable storage for lightning invoices mapped by invoice ID.
- [ ] Implement shared function createLightningInvoice(invoiceId, amount) to call Universal Bitcoin Bridge API and store invoice.
- [ ] Add query functions to get lightning invoice details and payment status.
- [ ] Extend Invoice type to optionally include lightning invoice reference.
- [ ] Modify addInvoice to optionally create lightning invoice if requested.

## Frontend
- [ ] Update or create hook (useInvoices or useLightningInvoices) to fetch lightning invoice data.
- [ ] Update InvoiceCreation.tsx:
  - Add payment method selection (Bitcoin on-chain or Lightning).
  - Call backend to create lightning invoice on submit if Lightning selected.
  - Display lightning invoice string and QR code in preview.
- [ ] Update ClientInvoiceView.tsx and ClientPaymentPortal.tsx:
  - Display lightning invoice string and QR code if lightning payment.
  - Add payment verification logic for lightning payments.
  - Allow toggling between Bitcoin and Lightning payment if both available.

## Integration & Testing
- [ ] Implement backend API calls to lightning.infernal.finance.
- [ ] Handle payment monitoring and status updates.
- [ ] Test end-to-end lightning invoice creation, display, and payment.
- [ ] Add error handling and edge case coverage.
