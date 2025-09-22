import { AuthClient } from '@dfinity/auth-client';
import { useState, useEffect, useCallback } from 'react';

export interface InternetIdentityContext {
  identity: any | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useInternetIdentity(): InternetIdentityContext {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const ident = client.getIdentity();
      setIdentity(ident);
      setIsAuthenticated(!client.getIdentity().getPrincipal().isAnonymous());
    };
    initAuth();
  }, []);

  const login = useCallback(async () => {
    if (!authClient) return;
    await authClient.login({
      identityProvider: import.meta.env.DFX_NETWORK === 'ic'
        ? 'https://identity.ic0.app'
        : 'http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai',
      onSuccess: () => {
        const ident = authClient.getIdentity();
        setIdentity(ident);
        setIsAuthenticated(!ident.getPrincipal().isAnonymous());
      },
    });
  }, [authClient]);

  const logout = useCallback(async () => {
    if (!authClient) return;
    await authClient.logout();
    setIdentity(null);
    setIsAuthenticated(false);
  }, [authClient]);

  return {
    identity,
    login,
    logout,
    isAuthenticated,
  };
}
