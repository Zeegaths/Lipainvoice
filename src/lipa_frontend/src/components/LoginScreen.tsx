import { useInternetIdentity } from "ic-use-internet-identity";
import { LogIn, Shield, Users, Award, AlertCircle } from "lucide-react";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { useToast } from "./ToastContainer";

const LoginScreen = () => {
  const { login, loginStatus } = useInternetIdentity();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { showError } = useToast();

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login();
    } catch (error: any) {
      console.error("Login error:", error);
      setIsLoggingIn(false);

      // Handle "already authenticated" error
      if (error.message === "User is already authenticated") {
        window.location.reload();
      } else {
        showError(
          "Login Failed",
          "Unable to connect to Internet Identity. Please try again."
        );
      }
    }
  };

  const isLoading = loginStatus === "logging-in" || isLoggingIn;

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
                  Your data is protected with Internet Identity
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

        {/* Login Button */}
        <div className="p-4">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-full font-bold"
          >
            {isLoading ? (
              <>
                <LoadingSpinner
                  size="sm"
                  color="gray"
                  className="mr-2 border-white"
                />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Login with Internet Identity
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-3 font-info">
            Secure, decentralized authentication powered by the Internet
            Computer
          </p>
        </div>

        {/* Error State */}
        {loginStatus === "error" && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 text-sm">
                Authentication failed. Please try again or check your internet
                connection.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
