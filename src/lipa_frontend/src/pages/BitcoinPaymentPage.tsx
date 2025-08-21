import React, { useState, useEffect } from "react";
import { Bitcoin, Copy, CheckCircle, Shield, ArrowLeft, QrCode, Timer, RefreshCw } from "lucide-react";

const BitcoinPaymentPage = () => {
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [copied, setCopied] = useState(false);
  const [confirmations, setConfirmations] = useState(0);

  const invoiceData = {
    invoiceNumber: "INV-2025-0001",
    freelancer: {
      name: "Sarah Chen",
      title: "Full Stack Developer",
      email: "sarah@techcorp.com",
      avatar: "SC",
    },
    amount: {
      usd: 2500.00,
      btc: 0.02847351,
      sats: 2847351,
    },
    items: [
      { description: "Frontend Development (40 hrs)", amount: 2000.00 },
      { description: "API Integration (10 hrs)", amount: 300.00 },
      { description: "Testing & Deployment (5 hrs)", amount: 200.00 },
    ],
    btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  };

  useEffect(() => {
    if (paymentStatus !== "pending") return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  useEffect(() => {
    if (paymentStatus === "confirming") {
      const confirmationTimer = setInterval(() => {
        setConfirmations((prev) => {
          if (prev >= 6) {
            setPaymentStatus("completed");
            clearInterval(confirmationTimer);
            return 6;
          }
          return prev + 1;
        });
      }, 2000);

      return () => clearInterval(confirmationTimer);
    }
  }, [paymentStatus]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentDetected = () => {
    setPaymentStatus("confirming");
    setConfirmations(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 backdrop-blur-xl bg-slate-950/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Invoice
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bitcoin className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">LipaInvoice</span>
          </div>

          <div className="flex items-center text-sm text-gray-400">
            <Shield className="h-4 w-4 mr-2" />
            Secure Payment
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
                  <h1 className="text-3xl font-bold text-white mb-2">Payment Request</h1>
                  <p className="text-gray-400">Invoice #{invoiceData.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white">${invoiceData.amount.usd.toLocaleString()}</div>
                  <div className="text-orange-400 font-semibold">₿{invoiceData.amount.btc}</div>
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
              {paymentStatus === "pending" && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                      <Bitcoin className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Pay with Bitcoin</h2>
                  <p className="text-gray-400 mb-6">Scan the QR code or copy the address below</p>
                  
                  {/* Timer */}
                  <div className="flex items-center justify-center space-x-2 mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                    <Timer className="h-5 w-5 text-orange-400" />
                    <span className="text-orange-400 font-semibold">Payment expires in {formatTime(timeRemaining)}</span>
                  </div>
                </div>
              )}

              {paymentStatus === "confirming" && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 text-white animate-spin" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Payment Detected</h2>
                  <p className="text-gray-400 mb-6">Waiting for blockchain confirmations</p>
                  
                  {/* Confirmation Progress */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Confirmations</span>
                      <span className="text-white font-semibold">{confirmations}/6</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(confirmations / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === "completed" && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Payment Completed!</h2>
                  <p className="text-gray-400 mb-6">Your payment has been successfully processed</p>
                  
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl mb-6">
                    <p className="text-green-400 font-semibold">Transaction confirmed with 6+ confirmations</p>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code and Payment Details */}
            {paymentStatus !== "completed" && (
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <div className="text-center mb-8">
                  <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                    <QrCode className="h-48 w-48 text-gray-800" />
                  </div>
                  <p className="text-gray-400 text-sm mt-4">Scan with your Bitcoin wallet</p>
                </div>

                {/* Payment Amount */}
                <div className="text-center mb-8 p-6 bg-white/5 rounded-2xl">
                  <div className="text-3xl font-black text-white mb-2">₿{invoiceData.amount.btc}</div>
                  <div className="text-gray-400">{invoiceData.amount.sats.toLocaleString()} sats</div>
                  <div className="text-sm text-gray-500 mt-2">${invoiceData.amount.usd.toLocaleString()} USD</div>
                </div>

                {/* Bitcoin Address */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-3">Bitcoin Address</label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-white break-all">
                        {invoiceData.btcAddress}
                      </div>
                      <button
                        onClick={() => copyToClipboard(invoiceData.btcAddress)}
                        className="flex items-center justify-center w-12 h-12 bg-orange-500/20 border border-orange-500/30 rounded-xl text-orange-400 hover:bg-orange-500/30 transition-colors"
                      >
                        {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Test Payment Button */}
                <button
                  onClick={handlePaymentDetected}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-colors"
                >
                  Complete Payment 
                </button>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Secure Payment</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This payment is secured by the Bitcoin blockchain. Your transaction is irreversible and will be permanently recorded on the blockchain once confirmed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinPaymentPage;