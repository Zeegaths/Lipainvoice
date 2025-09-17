import ReactDOM from 'react-dom/client';
import { InternetIdentityProvider } from 'ic-use-internet-identity';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

// Configure Internet Identity URL based on environment
const getIdentityProvider = () => {
  const isLocal = process.env.DFX_NETWORK === 'local' || process.env.NODE_ENV === 'development';
  
  if (isLocal) {
    // Get your Internet Identity canister ID for local development
    const iiCanisterId = process.env.REACT_APP_II_CANISTER_ID || 'rdmx6-jaaaa-aaaah-qdrva-cai';
    return `http://${iiCanisterId}.localhost:4943`;
  }
  
  return 'https://identity.ic0.app';
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <InternetIdentityProvider
            createOptions={{
                idleOptions: {
                    disableDefaultIdleCallback: true,
                    disableIdle: true,
                },
            }}
            loginOptions={{
                identityProvider: getIdentityProvider()
            }}
        >
            <App />
        </InternetIdentityProvider>
    </QueryClientProvider>
);