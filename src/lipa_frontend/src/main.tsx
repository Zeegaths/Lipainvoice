import ReactDOM from 'react-dom/client';
import { InternetIdentityProvider } from 'ic-use-internet-identity';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import '@nfid/identitykit/react/styles.css';
import { IdentityKitProvider, IdentityKitTheme } from '@nfid/identitykit/react';
import { IdentityKitAuthType, OISY } from '@nfid/identitykit';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <IdentityKitProvider
            authType={IdentityKitAuthType.ACCOUNTS}
            signers={[OISY]}
            theme={IdentityKitTheme.SYSTEM}
            allowInternetIdentityPinAuthentication
        >
            <App />
        </IdentityKitProvider>
    </QueryClientProvider>
);
