import { createActor } from '../../../declarations/lipa_backend';
import { useQuery } from '@tanstack/react-query';
import { _SERVICE } from '../../../declarations/lipa_backend/lipa_backend.did';
import { useEffect, useState } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useAgent } from './useAgent';
import { CANISTER_IDS } from '../config/canisterConfig';
import { getHost } from '../utils';

const ACTOR_QUERY_KEY = 'actor';

export function useActor() {
    const { identity } = useInternetIdentity();
    const [principal, setPrincipal] = useState<string | null>(null);
    const agent = useAgent();

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
            const canisterId = CANISTER_IDS.lipa_backend;
            if (!canisterId) {
                throw new Error('Canister ID for lipa_backend is not set');
            }

            if (!agent) {
                throw new Error('Agent is not available. Please connect your wallet first.');
            }

            const backendActor = createActor(canisterId, {
                agent,
                agentOptions: {
                    identity,
                    host: getHost()
                }

            });
            return backendActor;
        },
        staleTime: Infinity,
        enabled: !!agent && !!identity
    });

    return actorQuery.data;
}
