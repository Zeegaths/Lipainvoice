import { useAgent } from "@nfid/identitykit/react"
import { createActor, CreateActorOptions } from '../../../declarations/lipa_backend';
import { canisterId } from '../../../declarations/lipa_backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { _SERVICE } from '../../../declarations/lipa_backend/lipa_backend.did';
import { useEffect, useState } from 'react';
import { useAuth, useIdentity } from '@nfid/identitykit/react';
 

const ACTOR_QUERY_KEY = 'actor';

export function useActor() {
    const { user } = useAuth();
    const  identity = useIdentity();
    const agent = useAgent(); 
    const queryClient = useQueryClient();
    const [principal, setPrincipal] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setPrincipal(user.principal.toString());
        } else {
            setPrincipal(null);
        }
    }, [user]);

    const actorQuery = useQuery<_SERVICE>({
        queryKey: [ACTOR_QUERY_KEY, principal],
        queryFn: async () => {
            console.log("identity", identity)
            const actorOptions: CreateActorOptions = {
                agent,
            };

            const actor =  createActor(canisterId, actorOptions);

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
        isReady: !!actorQuery.data,
        makeAuthenticatedCall: async <T>(callFn: (actor: _SERVICE) => Promise<T>): Promise<T> => {
            if (!actorQuery.data) {
                throw new Error('Actor not initialized');
            }
            return await callFn(actorQuery.data);
        }
    };
}
