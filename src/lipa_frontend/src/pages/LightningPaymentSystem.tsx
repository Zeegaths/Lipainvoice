import React, { useState, useEffect } from "react";
import { Bitcoin, Copy, CheckCircle, Shield, ArrowLeft, QrCode, Timer, RefreshCw, Zap, Wallet, CreditCard, AlertCircle } from "lucide-react";
import { useLightningNetwork } from '../services/LightningService';

// Types for Lightning Network integration
interface LightningInvoiceData {
  id: string;
  payment_request: string;
  payment_hash: string;
  amount_msat: bigint;
  description: string;
  expires_at: bigint;
  status: 'pending' | 'paid' | 'expired';
  created_at: bigint;
}

interface InvoiceData {
  invoiceNumber: string;
  freelancer: {
    name: string;
    title: string;
    email: string;
    avatar: string;
  };
  amount: {
    usd: number;
    btc: number;
    sats: number;
  };
  items: Array<{
    description: string;
    amount: number;
  }>;
  clientName: string;
  projectTitle: string;
  projectDescription?: string;
  paymentMethod: string;
  lightningInvoice?: any;
}

interface LightningPaymentPageProps {
  onNavigate: (page: string) => void;
}

const LightningPaymentPage = ({ onNavigate }: LightningPaymentPageProps) => {
  // Lightning Network integration
  const { 
    isLoading: lightningLoading, 
    isAuthenticated: lightningAuthenticated, 
    wallet, 
    generateWallet, 
    createInvoice: createLightningInvoice,
    checkPayment,
    error: lightningError 
  } = useLightningNetwork();

  // Payment state
  const [paymentStatus, setPaymentStatus] = useState<'generating' | 'pending' | 'confirming' | 'completed' | 'failed'>('generating');
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [copied, setCopied] = useState(false);
  const [lightningInvoice, setLightningInvoice] = useState<LightningInvoiceData | null>(null);
  
  // Get invoice data from session storage
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);

  // Load invoice data on component mount
  useEffect(() => {
    const storedInvoiceData = sessionStorage.getItem('invoiceData');
    const storedLightningInvoice = sessionStorage.getItem('lightningInvoice');
    
    if (storedInvoiceData) {
      const parsed = JSON.parse(storedInvoiceData);
      setInvoiceData(parsed);
    }
    
    if (storedLightningInvoice) {
      const parsed = JSON.parse(storedLightningInvoice);
      setLightningInvoice(parsed);
      setPaymentStatus('pending');
    }
  }, []);

  // Initialize Lightning wallet and invoice if needed
  useEffect(() => {
    const initializeLightning = async () => {
      if (!lightningAuthenticated || !invoiceData) return;

      try {
        // Check if we already have a lightning invoice
        if (lightningInvoice) {
          setPaymentStatus('pending');
          return;
        }

        setPaymentStatus('generating');

        // Generate wallet if needed
        if (!wallet) {
          setIsGeneratingWallet(true);
          const walletResult = await generateWallet();
          setIsGeneratingWallet(false);
          
          if (!walletResult.success) {
            console.error('Failed to create wallet:', walletResult.error);
            setPaymentStatus('failed');
            return;
          }
        }

        // Create Lightning invoice
        const amountSats = invoiceData.amount.sats;
        const description = `${invoiceData.projectTitle} - ${invoiceData.clientName}`;
        
        const lightningResult = await createLightningInvoice(amountSats, description);

        if (lightningResult.success && lightningResult.invoice) {
          setLightningInvoice(lightningResult.invoice);
          sessionStorage.setItem('lightningInvoice', JSON.stringify(lightningResult.invoice));
          setPaymentStatus('pending');
        } else {
          console.error('Failed to create Lightning invoice:', lightningResult.error);
          setPaymentStatus('failed');
        }
      } catch (error) {
        console.error('Error initializing Lightning:', error);
        setPaymentStatus('failed');
      }
    };

    initializeLightning();
  }, [lightningAuthenticated, wallet, invoiceData, lightningInvoice]);

  // Timer for invoice expiry
  useEffect(() => {
    if (paymentStatus !== 'pending') return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  // Poll for payment status
  useEffect(() => {
    if (paymentStatus === 'pending' && lightningInvoice) {
      const interval = setInterval(async () => {
        try {
          const status = await checkPayment(lightningInvoice.payment_hash);
          if (status === 'paid') {
            setPaymentStatus('completed');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [paymentStatus, lightningInvoice, checkPayment]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestPayment = async () => {
    if (!lightningInvoice) return;
    
    setPaymentStatus('confirming');
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('completed');
    }, 2000);
  };

  const handleBackToInvoice = () => {
    // Clear session storage
    sessionStorage.removeItem('invoiceData');
    sessionStorage.removeItem('lightningInvoice');
    onNavigate('create-invoice');
  };

  // Show loading state if invoice data is not loaded
  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 backdrop-blur-xl bg-slate-950/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBackToInvoice}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Invoice
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Lightning Pay</span>
          </div>

          <div className="flex items-center text-sm text-gray-400">
            <Shield className="h-4 w-4 mr-2" />
            ICP Secured
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Invoice Details */}
          <div className="space-y-8">
            {/* Invoice Header */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Lightning Payment</h1>
                  <p className="text-gray-400">Invoice #{invoiceData.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">${invoiceData.amount.usd.toLocaleString()}</div>
                  <div className="text-yellow-400 font-semibold">{invoiceData.amount.sats.toLocaleString()} sats</div>
                </div>
              </div>

              {/* Freelancer Info */}
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {invoiceData.freelancer.avatar}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{invoiceData.freelancer.name}</h3>
                  <p className="text-gray-400 text-sm">{invoiceData.freelancer.title}</p>
                  <p className="text-gray-500 text-xs">{invoiceData.freelancer.email}</p>
                </div>
              </div>
            </div>

            {/* Lightning Wallet Info */}
            {wallet && (
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <div className="flex items-center mb-4">
                  <Wallet className="h-6 w-6 text-yellow-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Lightning Wallet</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Lightning Address</span>
                    <span className="text-white font-mono text-sm">{wallet.lightning_address}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Balance</span>
                    <span className="text-yellow-400 font-semibold">{Number(wallet.balance_sats)} sats</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Node ID</span>
                    <span className="text-white font-mono text-xs break-all">{wallet.node_pubkey.slice(0, 20)}...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Items */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Invoice Details</h3>
              
              <div className="space-y-4">
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-white/10 last:border-b-0">
                    <span className="text-gray-300">{item.description}</span>
                    <span className="text-white font-semibold">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="pt-4 mt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">Total</span>
                    <span className="text-2xl font-black text-white">${invoiceData.amount.usd.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Interface */}
          <div className="space-y-8">
            {/* Payment Status */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              {(paymentStatus === 'generating' || isGeneratingWallet) && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 text-white animate-spin" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isGeneratingWallet ? 'Setting up Lightning Wallet' : 'Generating Lightning Invoice'}
                  </h2>
                  <p className="text-gray-400 mb-6">
                    {isGeneratingWallet ? 'Creating your Lightning wallet...' : 'Creating your Lightning Network payment request...'}
                  </p>
                </div>
              )}

              {paymentStatus === 'pending' && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Pay with Lightning</h2>
                  <p className="text-gray-400 mb-6">Scan the QR code or copy the Lightning invoice</p>
                  
                  {/* Timer */}
                  <div className="flex items-center justify-center space-x-2 mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                    <Timer className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">Invoice expires in {formatTime(timeRemaining)}</span>
                  </div>
                </div>
              )}

              {paymentStatus === 'confirming' && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 text-white animate-spin" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Payment Processing</h2>
                  <p className="text-gray-400 mb-6">Lightning payment received, confirming...</p>
                </div>
              )}

              {paymentStatus === 'completed' && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Payment Completed!</h2>
                  <p className="text-gray-400 mb-6">Lightning payment confirmed instantly</p>
                  
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl mb-6">
                    <p className="text-green-400 font-semibold">Payment received via Lightning Network</p>
                  </div>
                  
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
                  <p className="text-gray-400 mb-6">
                    {lightningError || 'Invoice expired or payment failed'}
                  </p>
                  
                  <button
                    onClick={handleBackToInvoice}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors"
                  >
                    Create New Invoice
                  </button>
                </div>
              )}
            </div>

            {/* Lightning Invoice Details */}
            {lightningInvoice && paymentStatus === 'pending' && (
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <div className="text-center mb-8">
                  <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                    <QrCode className="h-48 w-48 text-gray-800" />
                  </div>
                  <p className="text-gray-400 text-sm mt-4">Scan with Lightning wallet</p>
                </div>

                {/* Payment Amount */}
                <div className="text-center mb-8 p-6 bg-white/5 rounded-2xl">
                  <div className="text-3xl font-black text-white mb-2">{invoiceData.amount.sats.toLocaleString()}</div>
                  <div className="text-gray-400">satoshis</div>
                  <div className="text-sm text-gray-500 mt-2">${invoiceData.amount.usd.toLocaleString()} USD</div>
                </div>

                {/* Lightning Invoice */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-3">Lightning Invoice</label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-white break-all max-h-32 overflow-y-auto">
                        {lightningInvoice.payment_request}
                      </div>
                      <button
                        onClick={() => copyToClipboard(lightningInvoice.payment_request)}
                        className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                      >
                        {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Test Payment Button */}
                <button
                  onClick={handleTestPayment}
                  className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors"
                >
                  Simulate Payment (Test)
                </button>
              </div>
            )}

            {/* Lightning Network Info */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Lightning Network Benefits</h4>
                  <ul className="text-gray-400 text-sm leading-relaxed space-y-1">
                    <li>• Instant payments with sub-second confirmation</li>
                    <li>• Ultra-low fees (typically &lt;1 cent)</li>
                    <li>• Powered by ICP's secure infrastructure</li>
                    <li>• Automatic wallet generation via Internet Identity</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightningPaymentPage;