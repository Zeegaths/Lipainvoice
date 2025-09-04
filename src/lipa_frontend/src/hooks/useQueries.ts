import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useActor } from './useActor';
import { useToast } from '../components/ToastContainer';
import { useAgent, useAuth } from '@nfid/identitykit/react';
import { canisterId, createActor, idlFactory } from '../../../declarations/lipa_backend';
import { Actor } from '@dfinity/agent';


export function useInvoices() {
  const { showToast } = useToast();
  const  agent  = useAgent();
  const { user } = useAuth();

  const backendActor = createActor(canisterId, {
    agent,
  })

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
      try {
        const invoices = await backendActor.listInvoices();
        return Array.isArray(invoices) ? invoices : [];
      } catch (error) {
        showToast({
          title: "Error fetching invoices",
          message: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        console.log(error)
        return [];
      }
    },
    enabled: !!user || !!agent,
  });
}

export function useAddInvoice() {
  const { user } = useAuth();
  const agent = useAgent();
  const { showToast} = useToast()
  const queryClient = useQueryClient();
  const backendActor = Actor.createActor(idlFactory, {
    agent,
    canisterId
  })
  return useMutation({
    mutationFn: async ({ id, details, address }: { id: bigint; details: string, address:string }) => {
      if(!agent || !user) {
        console.log("Agent or user not available");
        console.log(agent);
        console.log(user);
        throw new Error('Agent or user not available, will likely fail in the backend.');
      }
      
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
      console.log(error)
    }
  });
}
