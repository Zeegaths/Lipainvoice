import { useInternetIdentity } from 'ic-use-internet-identity';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import Dashboard from './pages/Dashboard';
import InvoiceCreation from './pages/InvoiceCreation';
import AdminDashboard from './pages/AdminDashboard';
import TaskLogger from './pages/TaskLogger';
import TeamPayments from './pages/TeamPayments';
import ClientPaymentPortal from './pages/ClientPaymentPortal';
import FreelancerSettings from './pages/FreelancerSettings';
import ClientInvoiceView from './pages/ClientInvoiceView';
import LandingPage from './pages/LandingPage';
import LoginScreen from './components/LoginScreen';
import NotificationCenter from './components/NotificationCenter';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastContainer';
import LoadingSpinner from './components/LoadingSpinner';
import BitcoinPaymentPage from './pages/BitcoinPaymentPage'

type Page = 'landing' | 'dashboard' | 'create-invoice' | 'admin' | 'task-logger' | 'team-payments' | 'client-portal' | 'settings' | 'my-wallet';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [clientPortalInvoiceId, setClientPortalInvoiceId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { identity, status:loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoading = loginStatus === 'logging-in';

  // Check if we should show client portal or public invoice view based on URL
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceIdFromUrl = urlParams.get('invoice');
  const pathSegments = window.location.pathname.split('/');
  const isPublicInvoiceView = pathSegments[1] === 'invoice' && pathSegments[2];
  
  // If there's an invoice ID in URL path and we're not authenticated, show public invoice view
  if (isPublicInvoiceView && !isAuthenticated) {
    const publicInvoiceId = pathSegments[2];
    return (
      <ErrorBoundary>
        <ToastProvider>
          <ClientInvoiceView invoiceId={publicInvoiceId} />
        </ToastProvider>
      </ErrorBoundary>
    );
  }
  
  // If there's an invoice ID in URL params and we're not authenticated, show client portal
  if (invoiceIdFromUrl && !isAuthenticated && currentPage !== 'client-portal') {
    setCurrentPage('client-portal');
    setClientPortalInvoiceId(invoiceIdFromUrl);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Connecting to Internet Identity...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we authenticate you</p>
        </div>
      </div>
    );
  }

  // Show client portal if requested
  if (currentPage === 'client-portal' && invoiceIdFromUrl) {
    return (
      <ErrorBoundary>
        <ToastProvider>
          <ClientPaymentPortal 
            invoiceId={invoiceIdFromUrl} 
            onBack={() => setCurrentPage('landing')} 
          />
        </ToastProvider>
      </ErrorBoundary>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    if (currentPage === 'landing') {
      return (
        <ErrorBoundary>
          <ToastProvider>
            <LandingPage onNavigate={setCurrentPage} />
          </ToastProvider>
        </ErrorBoundary>
      );
    } else {
      return (
        <ErrorBoundary>
          <ToastProvider>
            <LoginScreen />
          </ToastProvider>
        </ErrorBoundary>
      );
    }
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            currentPage={currentPage}
            onNavigate={(page: Page) => setCurrentPage(page)}
          />
          
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navigation */}
            <TopNavigation 
              onMenuClick={() => setSidebarOpen(true)}
              onSettingsClick={() => setCurrentPage('settings')}
              onNotificationsClick={() => setShowNotifications(true)}
            />
            
            {/* Main content area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
              <div className="animate-fade-in">
                {(() => {
                  switch (currentPage) {
                    case 'create-invoice':
                      return <InvoiceCreation onNavigate={setCurrentPage} />;
                    case 'admin':
                      return <AdminDashboard />;
                    case 'task-logger':
                      return <TaskLogger onNavigate={setCurrentPage} />;
                    case 'team-payments':
                      return <TeamPayments onNavigate={setCurrentPage} />;
                    case 'settings':
                      return <FreelancerSettings onNavigate={setCurrentPage} />;
                    default:
                      return <Dashboard onNavigate={setCurrentPage} />;
                  }
                })()}
              </div>
            </main>
            
            {/* Footer */}
            <footer className="footer no-print">
              Lipa Invoice © 2025 <span className="text-red-500">♥</span>
              <a 
                href="https://icphubkenya.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline focus:underline focus:outline-none"
              >
                
              </a>
            </footer>
          </div>

          {/* Notification Center */}
          {showNotifications && (
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;