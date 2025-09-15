import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ToastContainer';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor, idlFactory } from '../../../declarations/lipa_backend';
import { Actor, HttpAgent } from '@dfinity/agent';
import { CANISTER_IDS } from '../config/canisterConfig';

export function useInvoices() {
  const { showToast } = useToast();
  const { identity } = useInternetIdentity();
  const agent = identity ? new HttpAgent({ identity }) : null;

  return useQuery<Array<[bigint, any]>, Error>({
    queryKey: ['invoices', identity?.getPrincipal().toString()],
    queryFn: async (): Promise<Array<[bigint, any]>> => {
      if (!identity || !agent) {
        showToast({
          title: "Error fetching invoices",
          message: "No authentication found",
          type: "error",
        });
        return [];
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
    enabled: !!identity && !!agent,
  });
}

export function useAddInvoice() {
  const { identity } = useInternetIdentity();
  const agent = identity ? new HttpAgent({ identity }) : null;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address }: { id: bigint; details: string, address: string }) => {
      if (!agent || !identity) {
        console.log("Agent or identity not available");
        console.log(agent);
        console.log(identity);
        throw new Error('Agent or identity not available, will likely fail in the backend.');
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
