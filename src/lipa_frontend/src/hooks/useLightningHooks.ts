import { useQuery, useMutation } from '@tanstack/react-query';
import { createActor } from '../../../declarations/lipa_backend';

interface LightningInvoice {
  invoiceString: string;
  amount: bigint;
  expiry: bigint;
  status: string;
}

// Lightning Network hooks
export function useCreateLightningInvoice() {
  return useMutation({
    mutationFn: async ({ 
      invoiceId, 
      amountMsats, 
      memo 
    }: { 
      invoiceId: bigint; 
      amountMsats: bigint; 
      memo: string; 
    }) => {
      const actor = await createActor(import.meta.env.VITE_LIPA_BACKEND_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai');
      return actor.createLightningInvoice(invoiceId, amountMsats, memo);
    },
    onSuccess: () => {
      console.log('Lightning invoice created successfully');
    },
    onError: (error) => {
      console.error('Failed to create Lightning invoice:', error);
    },
  });
}

export function useVerifyLightningPayment() {
  return useMutation({
    mutationFn: async ({ invoiceId }: { invoiceId: bigint }) => {
      const actor = await createActor(import.meta.env.VITE_LIPA_BACKEND_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai');
      // For now, use getLightningInvoice to check status
      const invoice = await actor.getLightningInvoice(invoiceId);
      return invoice?.[0]?.status === 'paid';
    },
    onSuccess: () => {
      console.log('Lightning payment verified successfully');
    },
    onError: (error) => {
      console.error('Failed to verify Lightning payment:', error);
    },
  });
}

export function useLightningInvoiceStatus(invoiceId: bigint) {
  return useQuery({
    queryKey: ['lightning-invoice-status', invoiceId],
    queryFn: async () => {
      const actor = await createActor(import.meta.env.VITE_LIPA_BACKEND_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai');
      return actor.getLightningInvoice(invoiceId);
    },
    refetchInterval: 5000, // Poll every 5 seconds for Lightning payments
    enabled: !!invoiceId,
  });
}
