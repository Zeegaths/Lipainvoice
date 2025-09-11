import { useAgent } from "@nfid/identitykit/react"
import { createActor } from '../../../declarations/lipa_backend';
import { useQuery } from '@tanstack/react-query';
import { _SERVICE } from '../../../declarations/lipa_backend/lipa_backend.did';
import { useEffect, useState } from 'react';
import { useAuth } from '@nfid/identitykit/react';
import { CANISTER_IDS } from '../config/canisterConfig';

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
            const canisterId = CANISTER_IDS.lipa_backend;
            if (!canisterId) {
                throw new Error('Canister ID for lipa_backend is not set');
            }

            if (!agent) {
                throw new Error('Agent is not available. Please connect your wallet first.');
            }

            const backendActor = createActor(canisterId, {
                agent,
            });
            return backendActor;
        },
        staleTime: Infinity,
        enabled: !!agent && !!user
    });

    return actorQuery.data;
}
