import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ToastContainer';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor, idlFactory } from '../../../declarations/lipa_backend';
import { Actor, HttpAgent } from '@icp-sdk/core/agent';
import { CANISTER_IDS } from '../config/canisterConfig';
import { useAgent } from './useAgent';

interface InvoiceDetails {
  Client: string;
  Amount: string;
  Status: string;
  Project: string;
  Type: string;
  Hours?: string;
  Rate?: string;
  Description?: string;
}

interface InvoiceData {
  id: bigint;
  details: InvoiceDetails;
  files: Array<{
    name: string;
    path: string;
    size: bigint;
    mimeType: string;
    uploadedAt: bigint;
  }>;
  bitcoinAddress: [string] | string[];
  lightningInvoice: any[];
}


const parseInvoiceDetails = (detailsString: string): InvoiceDetails => {
  const detailsObj: Partial<InvoiceDetails> = {};
  
  const detailsArray = detailsString.split(', ');
  
  detailsArray.forEach(detail => {
    const colonIndex = detail.indexOf(': ');
    if (colonIndex > 0) {
      const key = detail.substring(0, colonIndex).trim();
      const value = detail.substring(colonIndex + 2).trim();
      
      switch (key) {
        case 'Client':
          detailsObj.Client = value;
          break;
        case 'Amount':
          detailsObj.Amount = value;
          break;
        case 'Status':
          detailsObj.Status = value as InvoiceDetails['Status'];
          break;
        case 'Project':
          detailsObj.Project = value;
          break;
        case 'Type':
          detailsObj.Type = value as InvoiceDetails['Type'];
          break;
        case 'Hours':
          detailsObj.Hours = value;
          break;
        case 'Rate':
          detailsObj.Rate = value;
          break;
        case 'Description':
          detailsObj.Description = value;
          break;
        default:
          (detailsObj as any)[key] = value;
      }
    }
  });
  
  return {
    Client: detailsObj.Client || 'Unknown Client',
    Amount: detailsObj.Amount || '0',
    Status: detailsObj.Status || 'pending',
    Project: detailsObj.Project || 'Unknown Project',
    Type: detailsObj.Type || 'service',
    Hours: detailsObj.Hours,
    Rate: detailsObj.Rate,
    Description: detailsObj.Description,
  };
};


export function useInvoices() {
  const { showToast } = useToast();
    const { identity } = useInternetIdentity();

  return useQuery<Array<[bigint, any]>, Error>({
    queryKey: ['invoices', identity?.getPrincipal().toString()],
    queryFn: async (): Promise<Array<[bigint, any]>> => {
      if (!identity) {
        showToast({
          title: "Error fetching invoices",
          message: "No authentication found",
          type: "error",
        });
        return [];
      }

      const host = import.meta.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : undefined;
      const agent = new HttpAgent({ identity, host });
      if (import.meta.env.DFX_NETWORK === 'local') {
        await agent.fetchRootKey();
      }

      const canisterId = CANISTER_IDS.lipa_backend;
      if (!canisterId) {
        throw new Error('Canister ID for lipa_backend is not set');
      }

      const backendActor = createActor(canisterId, {
        agent,
      });

      try {
        const invoices = await backendActor.listInvoices();
        return Array.isArray(invoices) ? invoices : [];
      } catch (error) {
        showToast({
          title: "Error fetching invoices",
          message: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        console.log(error);
        return [];
      }
    },
    enabled: !!identity,
  });
}

export function useAddInvoice() {
  const { identity } = useInternetIdentity();
  const agent = useAgent();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address }: { id: bigint; details: string, address: string | undefined }) => {
      if (!identity) {
        console.log("Identity not available");
        console.log(identity);
        throw new Error('Identity not available, will likely fail in the backend.');
      }

      const host = import.meta.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : undefined;
      const agent = new HttpAgent({ identity, host });
      if (import.meta.env.DFX_NETWORK === 'local') {
        await agent.fetchRootKey();
      }

      const canisterId = CANISTER_IDS.lipa_backend;
      if (!canisterId) {
        throw new Error('Canister ID for lipa_backend is not set');
      }

      const backendActor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });

      return backendActor.addInvoice(id, details, address ? [address] : []);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['invoices', identity?.getPrincipal().toString()]
      });
    },
    onError: (error) => {
      showToast({
        title: "Error adding invoice",
        message: error instanceof Error ? error.message.substring(100) : "Unknown error",
        type: "error",
      });
      console.log(error);
    }
  });
}

export function useInvoiceById(id: bigint) {
  const { identity } = useInternetIdentity();
  const agent = useAgent();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['invoice', id.toString()],
    queryFn: async (): Promise<InvoiceData> => {
      if (!identity) {
        showToast({
          title: "Error fetching invoices",
          message: "No authentication found. Please connect your wallet.",
          type: "error",
        });
        return {
          id: BigInt(0),
          details: {
            Client: '',
            Amount: '',
            Status: '',
            Project: '',
            Type: '',
          },
          files: [],
          bitcoinAddress: [],
          lightningInvoice: [],
        };
      }

      const host = import.meta.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : undefined;
      const agent = new HttpAgent({ identity, host });
      if (import.meta.env.DFX_NETWORK === 'local') {
        await agent.fetchRootKey();
      }

      const canisterId = CANISTER_IDS.lipa_backend;
      if (!canisterId) {
        throw new Error('Canister ID for lipa_backend is not set');
      }

      const backendActor = createActor(canisterId, {
        agent,
      });

      try {
        const invoice = await backendActor.getPublicInvoice(id);
        const nullInvoice = {
          id: BigInt(0),
          details: {
            Client: '',
            Amount: '',
            Status: '',
            Project: '',
            Type: '',
          },
          files: [],
          bitcoinAddress: [],
          lightningInvoice: [],
        };
        if (invoice.length === 0) {
          return nullInvoice;
        }
        const invoiceDetails = parseInvoiceDetails(invoice[0].details);
        return {
          id: invoice[0].id,
          details: invoiceDetails,
          files: invoice[0].files,
          bitcoinAddress: invoice[0].bitcoinAddress,
          lightningInvoice: invoice[0].lightningInvoice,
        };

      } catch (error) {
        showToast({
          title: "Error fetching invoices",
          message: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        console.log(error);
        return {
          id: BigInt(0),
          details: {
            Client: '',
            Amount: '',
            Status: '',
            Project: '',
            Type: '',
          },
          files: [],
          bitcoinAddress: [],
          lightningInvoice: [],
        };
      }
  },
  enabled: !!identity,
});
}

// Real Bitcoin payment verification hook
export function useVerifyBitcoinPayment() {
  const { identity } = useInternetIdentity();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ invoiceId, network }: { invoiceId: bigint; network: 'mainnet' | 'testnet' }) => {
      if (!identity) {
        throw new Error('Identity not available');
      }

      const host = import.meta.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : undefined;
      const agent = new HttpAgent({ identity, host });
      if (import.meta.env.DFX_NETWORK === 'local') {
        await agent.fetchRootKey();
      }

      const canisterId = CANISTER_IDS.lipa_backend;
      if (!canisterId) {
        throw new Error('Canister ID for lipa_backend is not set');
      }

      const backendActor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });

      // Convert network string to the expected format
      const networkParam = network === 'mainnet' ? { mainnet: null } : { testnet: null };
      
      return backendActor.updateInvoicePaymentStatus(invoiceId, networkParam);
    },
    onSuccess: (paymentReceived) => {
      if (paymentReceived) {
        showToast({
          title: "Payment Verified!",
          message: "Bitcoin payment has been confirmed on the blockchain.",
          type: "success",
        });
      } else {
        showToast({
          title: "No Payment Found",
          message: "No Bitcoin payment detected for this invoice address.",
          type: "warning",
        });
      }
    },
    onError: (error) => {
      showToast({
        title: "Payment Verification Failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
      });
    },
  });
}

// Get payment information hook
export function usePaymentInfo(invoiceId: bigint, network: 'mainnet' | 'testnet') {
  return useQuery({
    queryKey: ['payment-info', invoiceId, network],
    queryFn: async () => {
      const host = import.meta.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : undefined;
      const agent = new HttpAgent({ host });
      if (import.meta.env.DFX_NETWORK === 'local') {
        await agent.fetchRootKey();
      }

      const canisterId = CANISTER_IDS.lipa_backend;
      if (!canisterId) {
        throw new Error('Canister ID for lipa_backend is not set');
      }

      const backendActor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });

      const networkParam = network === 'mainnet' ? { mainnet: null } : { testnet: null };
      
      return backendActor.getPaymentInfo(invoiceId, networkParam);
    },
    enabled: !!invoiceId,
    refetchInterval: 30000, // Refetch every 30 seconds to check for new payments
  });
}

// Email notification hooks

// Send invoice creation email
export function useSendInvoiceEmail() {
  const { identity } = useInternetIdentity();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      clientEmail, 
      clientName, 
      invoiceId, 
      amount, 
      bitcoinAddress 
    }: { 
      clientEmail: string; 
      clientName: string; 
      invoiceId: bigint; 
      amount: string; 
      bitcoinAddress: string; 
    }) => {
      if (!identity) {
        throw new Error('Identity not available');
      }

      const host = import.meta.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : undefined;
      const agent = new HttpAgent({ identity, host });
      if (import.meta.env.DFX_NETWORK === 'local') {
        await agent.fetchRootKey();
      }

      const canisterId = CANISTER_IDS.lipa_backend;
      if (!canisterId) {
        throw new Error('Canister ID for lipa_backend is not set');
      }

      const backendActor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });

      return backendActor.sendInvoiceEmail(clientEmail, clientName, invoiceId, amount, bitcoinAddress);
    },
    onSuccess: () => {
      showToast({
        title: "Email Sent!",
        message: "Invoice notification email has been sent to the client.",
        type: "success",
      });
    },
    onError: (error) => {
      showToast({
        title: "Email Failed",
        message: error instanceof Error ? error.message : "Failed to send email notification",
        type: "error",
      });
    },
  });
}

// Send payment confirmation email
export function useSendPaymentConfirmationEmail() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      clientEmail, 
      clientName, 
      invoiceId, 
      amount, 
      freelancerName 
    }: { 
      clientEmail: string; 
      clientName: string; 
      invoiceId: bigint; 
      amount: string; 
      freelancerName: string; 
    }) => {
      const host = import.meta.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : undefined;
      const agent = new HttpAgent({ host });
      if (import.meta.env.DFX_NETWORK === 'local') {
        await agent.fetchRootKey();
      }

      const canisterId = CANISTER_IDS.lipa_backend;
      if (!canisterId) {
        throw new Error('Canister ID for lipa_backend is not set');
      }

      const backendActor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });

      return backendActor.sendPaymentConfirmationEmailPublic(clientEmail, clientName, invoiceId, amount, freelancerName);
    },
    onSuccess: () => {
      showToast({
        title: "Confirmation Sent!",
        message: "Payment confirmation email has been sent to the client.",
        type: "success",
      });
    },
    onError: (error) => {
      showToast({
        title: "Email Failed",
        message: error instanceof Error ? error.message : "Failed to send confirmation email",
        type: "error",
      });
    },
  });
}

// Send freelancer payment notification
export function useSendFreelancerPaymentEmail() {
  const { identity } = useInternetIdentity();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      invoiceId, 
      amount, 
      clientName 
    }: { 
      invoiceId: bigint; 
      amount: string; 
      clientName: string; 
    }) => {
      if (!identity) {
        throw new Error('Identity not available');
      }

      const host = import.meta.env.DFX_NETWORK === 'local' ? 'http://127.0.0.1:4943' : undefined;
      const agent = new HttpAgent({ identity, host });
      if (import.meta.env.DFX_NETWORK === 'local') {
        await agent.fetchRootKey();
      }

      const canisterId = CANISTER_IDS.lipa_backend;
      if (!canisterId) {
        throw new Error('Canister ID for lipa_backend is not set');
      }

      const backendActor = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });

      return backendActor.sendFreelancerPaymentEmail(invoiceId, amount, clientName);
    },
    onSuccess: () => {
      showToast({
        title: "Notification Sent!",
        message: "Payment notification has been sent to the freelancer.",
        type: "success",
      });
    },
    onError: (error) => {
      showToast({
        title: "Notification Failed",
        message: error instanceof Error ? error.message : "Failed to send payment notification",
        type: "error",
      });
    },
  });
}
