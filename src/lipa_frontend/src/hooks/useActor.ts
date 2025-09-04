import { useAgent } from "@nfid/identitykit/react"
import { createActor } from '../../../declarations/lipa_backend';
import { canisterId } from '../../../declarations/lipa_backend';
import { useQuery } from '@tanstack/react-query';
import { _SERVICE } from '../../../declarations/lipa_backend/lipa_backend.did';
import { useEffect, useState } from 'react';
import { useAuth, useIdentity } from '@nfid/identitykit/react';
 

const ACTOR_QUERY_KEY = 'actor';

export function useActor() {
    const { user } = useAuth();
    const agent = useAgent(); 
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
            
    const backendActor = createActor(canisterId, {
    agent,
    })
    return backendActor;
        },
        staleTime: Infinity,
        enabled: true
    });

    return actorQuery.data;
}
