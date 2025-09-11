/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LogIn, Shield, Users, Award } from "lucide-react";
import { useEffect } from "react";
import { CustomConnectedWallet, CustomConnectWallet } from "../pages/LandingPage";
import { Page } from "../App";
import { ConnectWallet, useAuth } from "@nfid/identitykit/react";

interface LoginScreenProps {
  onNavigate: (page: Page) => void;
}

const LoginScreen = ({ onNavigate }: LoginScreenProps) => {
  const { connect, disconnect, isConnecting, user } = useAuth();

  useEffect(() => {
    if (user) {
      onNavigate("dashboard");
    }
  }, [user, onNavigate]);

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
        <div className="p-4 w-full flex justify-center flex-col items-center">
          {/* @ts-ignore */}
          <ConnectWallet connectButtonComponent={CustomConnectWallet} connectedButtonComponent={CustomConnectedWallet} />
          <p className="text-xs text-gray-500 text-center mt-3 font-info">
            Secure, decentralized authentication powered by the Internet
            Computer
          </p>
        </div>


      </div>
    </div>
  );
};

export default LoginScreen;
