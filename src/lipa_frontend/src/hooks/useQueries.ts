import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ToastContainer';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor, idlFactory } from '../../../declarations/lipa_backend';
import { Actor, HttpAgent } from '@dfinity/agent';
import { CANISTER_IDS } from '../config/canisterConfig';

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
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address }: { id: bigint; details: string, address: string }) => {
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

      return backendActor.addInvoice(id, details, [address]);
    },
    onSuccess: () => {
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
