import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor } from '../../../declarations/lipa_backend';
import { canisterId } from '../../../declarations/lipa_backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { _SERVICE } from '../../../declarations/lipa_backend/lipa_backend.did';
import { useEffect } from 'react';

const ACTOR_QUERY_KEY = 'actor';
export function useActor() {
    const { identity } = useInternetIdentity();
    const queryClient = useQueryClient();

    const actorQuery = useQuery<_SERVICE>({
        queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
        queryFn: async () => {
            const isAuthenticated = !!identity;

            if (!isAuthenticated) {
                // Return anonymous actor if not authenticated
                return await createActor(canisterId);
            }

            const actorOptions = {
                agentOptions: {
                    identity
                }
            };

            const actor = await createActor(canisterId, actorOptions);
            await actor.initializeAuth();
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
        isFetching: actorQuery.isFetching
    };
}
