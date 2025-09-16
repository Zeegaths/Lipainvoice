import { LogIn, Shield, Users, Award, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginScreenProps {
  onNavigate: (page: Page) => void;
}

const LoginScreen = ({ onNavigate }: LoginScreenProps) => {
  const { identity, login, logout, isAuthenticated } = useInternetIdentity();
  const [authStatus, setAuthStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      onNavigate("dashboard");
    }
  }, [isAuthenticated, onNavigate]);

  const handleLogin = async () => {
    try {
      setAuthStatus('connecting');
      setAuthError(null);

      await login();

      setAuthStatus('success');
      setTimeout(() => onNavigate("dashboard"), 1000);
    } catch (error) {
      console.error("Internet Identity login error:", error);
      setAuthStatus('error');
      setAuthError(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthStatus('idle');
    onNavigate("landing");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in border border-gray-200 rounded-3xl py-4">
        {/* Logo and Title */}
        <div className="text-center mb-2">
          <div className="mx-auto h-16 w-16 flex items-center justify-center mb-4">
            <img src="/logo.png" alt="LipaInvoice" className="h-24 w-24" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LipaInvoice</h1>
          <p className="text-gray-600">
            Manage your freelance work with confidence
          </p>
        </div>

        {/* Features */}
        <div className=" p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center group">
              <div className="p-2 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors duration-200">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Secure Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  Your data is protected with decentralized wallets
                </p>
              </div>
            </div>
            <div className="flex items-center group">
              <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors duration-200">
                <LogIn className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Personal Dashboard
                </h3>
                <p className="text-sm text-gray-600">
                  Track invoices, tasks, and achievements
                </p>
              </div>
            </div>
            <div className="flex items-center group">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3 group-hover:bg-yellow-200 transition-colors duration-200">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Build Your Reputation
                </h3>
                <p className="text-sm text-gray-600">
                  Earn badges and showcase your skills
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        {authStatus !== 'idle' && (
          <div className="px-6 mb-4">
            <div className={`flex items-center p-3 rounded-lg ${
              authStatus === 'success' ? 'bg-green-50 border border-green-200' :
              authStatus === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {authStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : authStatus === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              ) : (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              )}
              <div>
                <p className={`text-sm font-medium ${
                  authStatus === 'success' ? 'text-green-800' :
                  authStatus === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {authStatus === 'connecting' && 'Connecting to wallet...'}
                  {authStatus === 'success' && 'Authentication successful!'}
                  {authStatus === 'error' && 'Authentication failed'}
                </p>
                {authError && (
                  <p className="text-sm text-red-600 mt-1">{authError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Login/Logout Button */}
        <div className="p-4 w-full flex justify-center flex-col items-center">
          {!isAuthenticated ? (
            <button
              onClick={handleLogin}
              disabled={authStatus === 'connecting'}
              className={`w-full max-w-xs px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                authStatus === 'connecting'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {authStatus === 'connecting'
                ? 'Authenticating...'
                : 'Connect Wallet'
              }
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full max-w-xs px-6 py-3 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
            >
              Logout
            </button>
          )}
          <p className="text-xs text-gray-500 text-center mt-3 font-info">
            Secure, decentralized authentication powered by Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
