import { HttpAgent } from '@icp-sdk/core/agent';
import { getEnvironment, getHost } from "../utils";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAgent(){
    const environment = getEnvironment();
    const { identity } = useInternetIdentity();
    const host = getHost();
    
    const agent = identity ? new HttpAgent({ 
        identity,
        host: host,
    }) : null;

    if (agent && environment !== "production") {
        agent.fetchRootKey().catch((err) => {
            console.warn(
                "Unable to fetch root key. Check to ensure that your local development environment is running"
            );
            console.error(err);
        });
    }

    return agent;
}