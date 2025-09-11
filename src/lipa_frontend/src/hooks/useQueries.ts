import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ToastContainer';
import { useAgent, useAuth } from '@nfid/identitykit/react';
import { createActor, idlFactory } from '../../../declarations/lipa_backend';
import { Actor } from '@dfinity/agent';
import { CANISTER_IDS } from '../config/canisterConfig';

export function useInvoices() {
  const { showToast } = useToast();
  const agent = useAgent();
  const { user } = useAuth();

  return useQuery<Array<[bigint, any]>, Error>({
    queryKey: ['invoices', user?.principal.toString()],
    queryFn: async (): Promise<Array<[bigint, any]>> => {
      if (!user || !agent) {
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
    enabled: !!user && !!agent,
  });
}

export function useAddInvoice() {
  const { user } = useAuth();
  const agent = useAgent();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address }: { id: bigint; details: string, address: string }) => {
      if (!agent || !user) {
        console.log("Agent or user not available");
        console.log(agent);
        console.log(user);
        throw new Error('Agent or user not available, will likely fail in the backend.');
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
        queryKey: ['invoices', user?.principal.toString()]
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
