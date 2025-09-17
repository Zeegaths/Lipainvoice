# Fix Invoice Creation Error and Implement PDF Generation

## Problem
- Delegation expiry error when creating invoice: "Invalid delegation expiry: Specified sender delegation has expired"
- Need to implement PDF generation for invoices (assuming "tando" refers to PDF generation)

## Plan
- [ ] Install jsPDF library for PDF generation
- [ ] Add error handling in useAddInvoice for delegation expiry to prompt re-login
- [ ] Implement PDF generation function in InvoiceCreation.tsx using jsPDF
- [ ] Update downloadPDF function to generate and download PDF invoice

## Dependent Files
- src/lipa_frontend/package.json (add jsPDF)
- src/lipa_frontend/src/hooks/useQueries.ts
- src/lipa_frontend/src/pages/InvoiceCreation.tsx

## Followup Steps
- Test invoice creation after re-login
- Test PDF download functionality
- Verify PDF contains all invoice details
