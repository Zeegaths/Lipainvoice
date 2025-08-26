import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor } from '../../../declarations/lipa_backend';
import { canisterId } from '../../../declarations/lipa_backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { _SERVICE } from '../../../declarations/lipa_backend/lipa_backend.did';
import { useEffect, useState } from 'react';

const ACTOR_QUERY_KEY = 'actor';

export function useActor() {
    const { identity } = useInternetIdentity();
    const queryClient = useQueryClient();
    const [principal, setPrincipal] = useState<string | null>(null);

    useEffect(() => {
        if (identity) {
            setPrincipal(identity.getPrincipal().toString());
        } else {
            setPrincipal(null);
        }
    }, [identity]);

    const actorQuery = useQuery<_SERVICE>({
        queryKey: [ACTOR_QUERY_KEY, principal],
        queryFn: async () => {
            if (!identity) {
                // Return anonymous actor if not authenticated
                return await createActor(canisterId);
            }

            const actorOptions = {
                agentOptions: {
                    identity
                }
            };

            const actor =  createActor(canisterId, actorOptions);
            
            // Initialize auth if the method exists
            try {
                await actor.initializeAuth();
            } catch (error) {
                console.warn('initializeAuth method not available or failed:', error);
            }
            
            return actor;
        },
        // Only refetch when identity changes
        staleTime: Infinity,
        // This will cause the actor to be recreated when the identity changes
        enabled: true
    });

    // When the actor changes, invalidate dependent queries
    useEffect(() => {
        if (actorQuery.data) {
            queryClient.invalidateQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
            queryClient.refetchQueries({
                predicate: (query) => {
                    return !query.queryKey.includes(ACTOR_QUERY_KEY);
                }
            });
        }
    }, [actorQuery.data, queryClient]);

    return {
        actor: actorQuery.data || null,
        isFetching: actorQuery.isFetching,
        identity,
        principal,
        // Helper method to check if actor is ready for authenticated calls
        isReady: !!actorQuery.data,
        // Helper method for making authenticated calls
        makeAuthenticatedCall: async <T>(callFn: (actor: _SERVICE) => Promise<T>): Promise<T> => {
            if (!actorQuery.data) {
                throw new Error('Actor not initialized');
            }
            return await callFn(actorQuery.data);
        }
    };
}
