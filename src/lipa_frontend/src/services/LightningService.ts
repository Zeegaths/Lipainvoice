// File: src/lipa_frontend/src/services/LightningService.ts
import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from 'ic-use-internet-identity';

// Types for Lightning Network
interface LightningWallet {
  principal: Principal;
  lightning_address: string;
  node_pubkey: string;
  balance_sats: bigint;
  created_at: bigint;
}

interface LightningInvoice {
  id: string;
  payment_request: string;
  payment_hash: string;
  amount_msat: bigint;
  description: string;
  expires_at: bigint;
  status: 'pending' | 'paid' | 'expired';
  created_at: bigint;
}

// ICP Canister Interface Definition (IDL) - Updated to match your backend
export const lightningCanisterIDL = ({ IDL }: any) => {
  const Principal = IDL.Principal;
  const Result = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });

  const LightningWallet = IDL.Record({
    'principal': Principal,
    'lightning_address': IDL.Text,
    'node_pubkey': IDL.Text,
    'balance_sats': IDL.Nat64,
    'created_at': IDL.Int,
  });

  const InvoiceStatus = IDL.Variant({
    'pending': IDL.Null,
    'paid': IDL.Null,
    'expired': IDL.Null,
  });

  const LightningInvoice = IDL.Record({
    'id': IDL.Text,
    'payment_request': IDL.Text,
    'payment_hash': IDL.Text,
    'amount_msat': IDL.Nat64,
    'description': IDL.Text,
    'expires_at': IDL.Int,
    'status': InvoiceStatus,
    'created_at': IDL.Int,
  });

  return IDL.Service({
    // Wallet management
    'generate_lightning_wallet': IDL.Func([], [Result], []),
    'get_wallet': IDL.Func([], [IDL.Opt(LightningWallet)], ['query']),
    'get_wallet_balance': IDL.Func([], [IDL.Nat64], ['query']),

    // Invoice management
    'create_lightning_invoice': IDL.Func([
      IDL.Nat64, // amount_msat
      IDL.Text,  // description
      IDL.Nat64, // expiry_seconds
    ], [Result], []),
    'get_invoice': IDL.Func([IDL.Text], [IDL.Opt(LightningInvoice)], ['query']),
    'check_payment_status': IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'list_invoices': IDL.Func([], [IDL.Vec(LightningInvoice)], ['query']),

    // Payment processing
    'process_payment': IDL.Func([IDL.Text, IDL.Text], [Result], []),

    // Health check
    'health_check': IDL.Func([], [IDL.Record({
      'status': IDL.Text,
      'timestamp': IDL.Int,
      'canister_id': IDL.Text,
    })], ['query']),
  });
};

// React Hook for Lightning Network Integration (REAL IMPLEMENTATION)
export function useLightningNetwork() {
  const { identity, isInitializing } = useInternetIdentity();
  const [wallet, setWallet] = useState<LightningWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actor, setActor] = useState<any>(null);

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  // Initialize Lightning actor
  useEffect(() => {
    if (identity && isAuthenticated) {
      try {
        // Replace with your actual Lightning canister ID
        const LIGHTNING_CANISTER_ID = process.env.REACT_APP_LIGHTNING_CANISTER_ID || 'vizcg-th777-77774-qaaea-cai';

        const host = process.env.DFX_NETWORK === 'local'
          ? 'http://127.0.0.1:4943'
          : 'https://ic0.app';

        const agent = new HttpAgent({ host, identity });

        if (process.env.DFX_NETWORK === 'local') {
          agent.fetchRootKey().catch(console.warn);
        }

        const lightningActor = Actor.createActor(lightningCanisterIDL, {
          agent,
          canisterId: LIGHTNING_CANISTER_ID,
        });

        setActor(lightningActor);

        // Try to fetch existing wallet
        fetchWallet(lightningActor);

      } catch (err) {
        console.error('Error initializing Lightning actor:', err);
        setError('Failed to connect to Lightning Network');
      }
    }
  }, [identity, isAuthenticated]);

  const fetchWallet = async (lightningActor?: any) => {
    if (!lightningActor && !actor) return;

    const currentActor = lightningActor || actor;

    try {
      setIsLoading(true);
      const result = await currentActor.get_wallet();

      if (result && result.length > 0) {
        setWallet(result[0]);
      } else {
        setWallet(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setError('Failed to fetch wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWallet = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated || !actor) {
      return { success: false, error: 'User not authenticated or actor not ready' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await actor.generate_lightning_wallet();

      if ('ok' in result) {
        // Fetch the newly created wallet
        await fetchWallet();
        return { success: true };
      } else {
        const errorMsg = result.err;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate wallet';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const createInvoice = async (amountSats: number, description: string): Promise<{ success: boolean; invoice?: LightningInvoice; error?: string }> => {
    if (!isAuthenticated || !actor) {
      return { success: false, error: 'User not authenticated or actor not ready' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountMsat = BigInt(amountSats * 1000);
      const expirySeconds = BigInt(15 * 60); // 15 minutes

      const result = await actor.create_lightning_invoice(amountMsat, description, expirySeconds);

      if ('ok' in result) {
        try {
          // Parse the JSON response from your backend
          const invoiceData = JSON.parse(result.ok);

          // Handle the nested structure from your backend
          if (invoiceData.success && invoiceData.invoice) {
            const invoice: LightningInvoice = {
              id: invoiceData.invoice.id,
              payment_request: invoiceData.invoice.payment_request,
              payment_hash: invoiceData.invoice.payment_hash,
              amount_msat: BigInt(invoiceData.invoice.amount_msat),
              description: invoiceData.invoice.description,
              expires_at: BigInt(invoiceData.invoice.expires_at),
              status: invoiceData.invoice.status as 'pending' | 'paid' | 'expired',
              created_at: BigInt(invoiceData.invoice.created_at),
            };

            return { success: true, invoice };
          } else {
            // Handle direct invoice data (your current format)
            const invoice: LightningInvoice = {
              id: invoiceData.id,
              payment_request: invoiceData.payment_request,
              payment_hash: invoiceData.payment_hash,
              amount_msat: BigInt(invoiceData.amount_msat),
              description: invoiceData.description,
              expires_at: BigInt(invoiceData.expires_at),
              status: invoiceData.status as 'pending' | 'paid' | 'expired',
              created_at: BigInt(invoiceData.created_at),
            };

            return { success: true, invoice };
          }
        } catch (parseError) {
          console.error('Error parsing invoice JSON:', parseError);
          return { success: false, error: 'Failed to parse invoice response' };
        }
      } else {
        const errorMsg = result.err;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const checkPayment = async (paymentHash: string): Promise<string> => {
    if (!actor) return 'unknown';

    try {
      return await actor.check_payment_status(paymentHash);
    } catch (err) {
      console.error('Error checking payment status:', err);
      return 'unknown';
    }
  };

  const listInvoices = async (): Promise<LightningInvoice[]> => {
    if (!actor) return [];

    try {
      return await actor.list_invoices();
    } catch (err) {
      console.error('Error listing invoices:', err);
      return [];
    }
  };

  const processPayment = async (paymentRequest: string, paymentHash: string): Promise<{ success: boolean; error?: string }> => {
    if (!actor) {
      return { success: false, error: 'Actor not ready' };
    }

    try {
      const result = await actor.process_payment(paymentRequest, paymentHash);

      if ('ok' in result) {
        return { success: true };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Payment processing failed'
      };
    }
  };

  // Health check function
  const healthCheck = async () => {
    if (!actor) return null;

    try {
      return await actor.health_check();
    } catch (err) {
      console.error('Health check failed:', err);
      return null;
    }
  };

  return {
    // Connection status
    isLoading: isLoading || isInitializing,
    isAuthenticated,
    wallet,
    error,

    // Wallet operations
    generateWallet,

    // Invoice operations
    createInvoice,
    checkPayment: checkPayment,
    listInvoices,

    // Payment operations
    processPayment,

    // Utility
    healthCheck,
    refreshWallet: () => fetchWallet(),
  };
}

// Lightning Network Service Class (REAL IMPLEMENTATION)
export class LightningNetworkService {
  private agent: HttpAgent;
  private canisterId: string;
  private actor: any;

  // In your LightningService.ts
  constructor(canisterId: string, identity?: any) {
    this.canisterId = canisterId;

    const host = process.env.DFX_NETWORK === 'local'
      ? 'http://127.0.0.1:4943'  // Local replica
      : 'https://ic0.app';       // Mainnet

    this.agent = new HttpAgent({ host });

    if (identity) {
      this.agent.replaceIdentity(identity);
    }

    // Only fetch root key for local development
    if (process.env.DFX_NETWORK === 'local') {
      this.agent.fetchRootKey().catch((err) => {
        console.warn('Failed to fetch root key:', err);
      });
    }

    this.createActor();
  }

  private createActor() {
    this.actor = Actor.createActor(lightningCanisterIDL, {
      agent: this.agent,
      canisterId: this.canisterId,
    });
  }

  updateIdentity(identity: any) {
    this.agent.replaceIdentity(identity);
    this.createActor();
  }

  async generateLightningWallet(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.actor.generate_lightning_wallet();

      if ('ok' in result) {
        return { success: true };
      } else {
        return { success: false, error: result.err };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getWallet(): Promise<LightningWallet | null> {
    try {
      const result = await this.actor.get_wallet();
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting wallet:', error);
      return null;
    }
  }

  async createLightningInvoice(
    amountSats: number,
    description: string,
    expiryMinutes: number = 15
  ): Promise<{ success: boolean; invoice?: LightningInvoice; error?: string }> {
    try {
      const amountMsat = BigInt(amountSats * 1000);
      const expirySeconds = BigInt(expiryMinutes * 60);

      const result = await this.actor.create_lightning_invoice(
        amountMsat,
        description,
        expirySeconds
      );

      if ('ok' in result) {
        const invoiceData = JSON.parse(result.ok);
        return { success: true, invoice: invoiceData };
      } else {
        return { success: false, error: result.err };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice'
      };
    }
  }
}

// Utility functions for Lightning Network
export const lightningUtils = {
  satsToMsat: (sats: number) => BigInt(sats * 1000),
  msatToSats: (msat: bigint) => Number(msat) / 1000,

  formatSats: (sats: number) => sats.toLocaleString(),
  formatMsat: (msat: bigint) => (Number(msat) / 1000).toLocaleString(),

  generateQRCode: (data: string, size: number = 300) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  },

  isValidLightningAddress: (address: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(address);
  },

  generateLightningAddress: (principal: string, domain: string) => {
    const username = principal.slice(0, 8);
    return `${username}@${domain}`;
  },
};

export default LightningNetworkService;