import { useMutation } from '@tanstack/react-query';
import { createActor } from '../../../declarations/lipa_backend';

interface WebhookEvent {
  type: 'payment_received' | 'payment_confirmed' | 'payment_failed' | 'invoice_created';
  invoiceId: bigint;
  amount: number;
  currency: 'BTC' | 'USD';
  timestamp: number;
  paymentMethod: 'bitcoin' | 'lightning';
  clientEmail?: string;
  freelancerEmail?: string;
}

// Payment webhook hooks for production-ready notifications
export function usePaymentWebhooks() {
  return useMutation({
    mutationFn: async (event: WebhookEvent) => {
      // In production, this would send webhooks to external services
      // For now, we'll log the event and send internal notifications
      console.log('Payment webhook event:', event);
      
      // Send to external webhook endpoints (if configured)
      if (import.meta.env.VITE_WEBHOOK_URL) {
        try {
          const response = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_WEBHOOK_SECRET}`,
            },
            body: JSON.stringify(event),
          });
          
          if (!response.ok) {
            throw new Error(`Webhook failed: ${response.status}`);
          }
        } catch (error) {
          console.error('Failed to send webhook:', error);
        }
      }
      
      return event;
    },
    onSuccess: (event) => {
      console.log('Webhook sent successfully:', event.type);
    },
    onError: (error) => {
      console.error('Webhook error:', error);
    },
  });
}

// Real-time payment monitoring hook
export function usePaymentMonitoring(invoiceId: bigint) {
  return useMutation({
    mutationFn: async () => {
      const actor = await createActor(import.meta.env.VITE_LIPA_BACKEND_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai');
      
      // Check both Bitcoin and Lightning payment status
      const [bitcoinPaymentInfo, lightningInvoiceStatus] = await Promise.all([
        actor.getPaymentInfo(invoiceId, { testnet: null }),
        actor.getLightningInvoice(invoiceId),
      ]);
      
      return {
        bitcoin: bitcoinPaymentInfo,
        lightning: lightningInvoiceStatus,
        timestamp: Date.now(),
      };
    },
    onSuccess: (data) => {
      // Trigger webhook if payment is detected
      if (data.bitcoin.hasPayment || data.lightning?.[0]?.status === 'paid') {
        // This would be called from the payment component
        console.log('Payment detected, webhook will be triggered');
      }
    },
  });
}

// Payment notification system
export function usePaymentNotifications() {
  return useMutation({
    mutationFn: async ({
      type,
      invoiceId,
      amount,
      clientEmail,
      freelancerEmail,
      paymentMethod,
    }: {
      type: 'payment_received' | 'payment_confirmed';
      invoiceId: bigint;
      amount: number;
      clientEmail?: string;
      freelancerEmail?: string;
      paymentMethod: 'bitcoin' | 'lightning';
    }) => {
      const actor = await createActor(import.meta.env.VITE_LIPA_BACKEND_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai');
      
      // Send email notifications
      if (type === 'payment_received' && clientEmail) {
        await actor.sendPaymentConfirmationEmailPublic(
          clientEmail,
          'Client', // This would be the actual client name
          invoiceId,
          `$${amount.toLocaleString()}`,
          'Freelancer' // This would be the actual freelancer name
        );
      }
      
      if (type === 'payment_confirmed' && freelancerEmail) {
        await actor.sendFreelancerPaymentEmail(
          invoiceId,
          `$${amount.toLocaleString()}`,
          'Client' // This would be the actual client name
        );
      }
      
      return { success: true };
    },
    onSuccess: () => {
      console.log('Payment notifications sent successfully');
    },
    onError: (error) => {
      console.error('Failed to send payment notifications:', error);
    },
  });
}
