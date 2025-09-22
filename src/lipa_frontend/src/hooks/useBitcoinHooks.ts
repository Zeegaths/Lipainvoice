import { useQuery } from '@tanstack/react-query';
import { createActor } from '../../../declarations/lipa_backend';

// Bitcoin address generation hooks
export function useGenerateBitcoinAddress(network: 'mainnet' | 'testnet', derivationPath: number[][]) {
  return useQuery({
    queryKey: ['bitcoin-address', network, derivationPath],
    queryFn: async () => {
      const actor = await createActor(import.meta.env.VITE_LIPA_BACKEND_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai');
      const networkParam = network === 'mainnet' ? { mainnet: null } : { testnet: null };
      return actor.generateBitcoinAddress(networkParam, derivationPath);
    },
    staleTime: Infinity, // Address should never change for the same derivation path
  });
}

export function useGenerateP2TRAddress(network: 'mainnet' | 'testnet', derivationPaths: { key_path_derivation_path: number[][]; script_path_derivation_path: number[][] }) {
  return useQuery({
    queryKey: ['p2tr-address', network, derivationPaths],
    queryFn: async () => {
      const actor = await createActor(import.meta.env.VITE_LIPA_BACKEND_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai');
      const networkParam = network === 'mainnet' ? { mainnet: null } : { testnet: null };
      return actor.generateP2TRAddress(networkParam, derivationPaths);
    },
    staleTime: Infinity, // Address should never change for the same derivation path
  });
}
