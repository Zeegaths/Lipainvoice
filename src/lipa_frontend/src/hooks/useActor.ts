import { useInternetIdentity } from 'ic-use-internet-identity';
import { createActor } from '../../../declarations/lipa_backend';
import { canisterId } from '../../../declarations/lipa_backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { _SERVICE } from '../../../declarations/lipa_backend/lipa_backend.did';
import { useEffect, useState } from 'react';
import { HttpAgent } from '@dfinity/agent';

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

    const createLocalAgent = (identity?: any) => {
        const isLocal = process.env.DFX_NETWORK === 'local' || process.env.NODE_ENV === 'development';

        const host = isLocal
            ? 'http://127.0.0.1:4943'
            : 'https://ic0.app';

        const agent = new HttpAgent({
            host,
            verifyQuerySignatures: !isLocal,
            ...(identity && { identity })
        });

        // Fetch root key for local development
        if (isLocal) {
            agent.fetchRootKey().catch(console.warn);
        }

        return agent;
    };


    const actorQuery = useQuery<_SERVICE>({
        queryKey: [ACTOR_QUERY_KEY, principal],
        queryFn: async () => {
            if (!identity) {
                // Create anonymous actor with local agent
                const agent = createLocalAgent();
                return await createActor(canisterId, { agent });
            }

            // Create authenticated actor with local agent
            const agent = createLocalAgent(identity);
            const actor = createActor(canisterId, { agent });

            try {
                await actor.initializeAuth();
            } catch (error) {
                console.warn('initializeAuth method not available or failed:', error);
            }

            return actor;
        },
        staleTime: Infinity,
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
