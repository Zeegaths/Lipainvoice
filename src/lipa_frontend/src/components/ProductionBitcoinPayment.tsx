import React, { useState, useEffect } from 'react';
import { Bitcoin, Zap, Copy, CheckCircle, Clock, AlertCircle, QrCode, ExternalLink, RefreshCw, Eye, EyeOff, Settings, Shield, TrendingUp } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createActor } from '../../../declarations/lipa_backend';
import { usePaymentInfo, useVerifyBitcoinPayment } from '../hooks/useQueries';
import { useGenerateBitcoinAddress } from '../hooks/useBitcoinHooks';

interface ProductionBitcoinPaymentProps {
  invoiceId: bigint;
  amount: number; // BTC amount
  clientName: string;
  freelancerName: string;
  onPaymentConfirmed?: () => void;
}

interface PaymentInfo {
  address: string | null;
  balance: bigint;
  utxos: Array<{
    outpoint: { txid: Array<number>; vout: number };
    value: bigint;
    height: number;
  }>;
  hasPayment: boolean;
}

interface LightningInvoice {
  paymentRequest: string;
  amount: number;
  expiry: number;
  status: 'pending' | 'paid' | 'expired';
}

type PaymentMethod = 'bitcoin' | 'lightning';

const ProductionBitcoinPayment: React.FC<ProductionBitcoinPaymentProps> = ({
  invoiceId,
  amount,
  clientName,
  freelancerName,
  onPaymentConfirmed
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bitcoin');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'confirmed' | 'failed'>('pending');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showQRCode, setShowQRCode] = useState(true);
  const [btcToUsd] = useState(45000); // Mock BTC to USD rate
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour in seconds
  const [lightningInvoice, setLightningInvoice] = useState<LightningInvoice | null>(null);

  // Generate unique Bitcoin address for this invoice
  const derivationPath: number[][] = [[0], invoiceId.toString().split('').map(c => parseInt(c))];
  const { data: bitcoinAddress, isLoading: addressLoading } = useGenerateBitcoinAddress('testnet', derivationPath);

  // Monitor payment status
  const paymentInfoQuery = usePaymentInfo(invoiceId, 'testnet');
  const paymentInfo = paymentInfoQuery.data as PaymentInfo | undefined;

  const verifyPaymentMutation = useVerifyBitcoinPayment();

  // Create Lightning invoice
  const createLightningInvoiceMutation = useMutation({
    mutationFn: async (amountMsats: number) => {
      // Mock Lightning invoice creation - in production, integrate with Lightning service
      const mockInvoice: LightningInvoice = {
        paymentRequest: `lnbc${amountMsats}u1p${Math.random().toString(36).substring(2, 15)}...`,
        amount: amountMsats / 1000, // Convert msats to sats
        expiry: Date.now() + 3600000, // 1 hour
        status: 'pending'
      };
      return mockInvoice;
    },
    onSuccess: (invoice) => {
      setLightningInvoice(invoice);
    }
  });

  // Auto-update payment status when payment is detected
  useEffect(() => {
    if (paymentInfo?.hasPayment && paymentStatus === 'pending') {
      setPaymentStatus('confirmed');
      onPaymentConfirmed?.();
    }
  }, [paymentInfo?.hasPayment, paymentStatus, onPaymentConfirmed]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateQRCode = (data: string, label?: string) => {
    const params = new URLSearchParams({
      size: '300x300',
      data: data,
      ...(label && { label: label })
    });
    return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleVerifyPayment = () => {
    setPaymentStatus('verifying');
    verifyPaymentMutation.mutate({ invoiceId, network: 'testnet' }, {
      onSuccess: (paymentReceived) => {
        if (paymentReceived) {
          setPaymentStatus('confirmed');
          onPaymentConfirmed?.();
        } else {
          setPaymentStatus('failed');
        }
      },
      onError: () => {
        setPaymentStatus('failed');
      }
    });
  };

  const refreshPaymentInfo = () => {
    paymentInfoQuery.refetch();
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'lightning' && !lightningInvoice) {
      createLightningInvoiceMutation.mutate(Math.floor(amount * 100000000 * 1000)); // Convert BTC to msats
    }
  };

  if (addressLoading || !bitcoinAddress) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating payment address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {paymentMethod === 'lightning' ? (
              <Zap className="h-8 w-8 mr-3" />
            ) : (
              <Bitcoin className="h-8 w-8 mr-3" />
            )}
            <div>
              <h3 className="text-2xl font-bold">
                {paymentMethod === 'lightning' ? 'Lightning Payment' : 'Bitcoin Payment'}
              </h3>
              <p className="text-orange-100">
                {paymentMethod === 'lightning' ? 'Fast & Low-Cost' : 'Secure Blockchain Payment'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{amount.toFixed(8)} BTC</div>
            <div className="text-orange-100">≈ ${(amount * btcToUsd).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Payment Method Selection */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Choose Payment Method</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handlePaymentMethodChange('bitcoin')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'bitcoin'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Bitcoin className={`h-6 w-6 mr-3 ${paymentMethod === 'bitcoin' ? 'text-orange-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`font-medium ${paymentMethod === 'bitcoin' ? 'text-orange-900' : 'text-gray-900'}`}>
                    Bitcoin (On-Chain)
                  </p>
                  <p className="text-sm text-gray-600">Secure • Decentralized • ~10 min</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handlePaymentMethodChange('lightning')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'lightning'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Zap className={`h-6 w-6 mr-3 ${paymentMethod === 'lightning' ? 'text-orange-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`font-medium ${paymentMethod === 'lightning' ? 'text-orange-900' : 'text-gray-900'}`}>
                    Lightning Network
                  </p>
                  <p className="text-sm text-gray-600">Fast • Low Fees • Instant</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {paymentStatus === 'confirmed' ? (
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              ) : paymentStatus === 'verifying' ? (
                <RefreshCw className="h-6 w-6 text-blue-600 mr-2 animate-spin" />
              ) : paymentStatus === 'failed' ? (
                <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              ) : (
                <Clock className="h-6 w-6 text-yellow-600 mr-2" />
              )}
              <span className="font-semibold text-lg">
                {paymentStatus === 'confirmed' ? 'Payment Confirmed' :
                 paymentStatus === 'verifying' ? 'Verifying Payment...' :
                 paymentStatus === 'failed' ? 'Payment Failed' :
                 'Awaiting Payment'}
              </span>
            </div>
            <button
              onClick={refreshPaymentInfo}
              disabled={paymentInfoQuery.isFetching}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${paymentInfoQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Timer */}
          {paymentStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Payment expires in:</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatTime(timeRemaining)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Address/Invoice Section */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              {paymentMethod === 'lightning' ? (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Lightning Invoice
                </>
              ) : (
                <>
                  <Bitcoin className="h-5 w-5 mr-2" />
                  Payment Address
                </>
              )}
            </h4>
            
            {paymentMethod === 'lightning' ? (
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <div className="break-all text-sm font-mono text-gray-800 mb-3">
                  {lightningInvoice?.paymentRequest || 'Generating Lightning invoice...'}
                </div>
                <button
                  onClick={() => copyToClipboard(lightningInvoice?.paymentRequest || '')}
                  disabled={!lightningInvoice}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {copiedAddress ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Invoice
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <div className="break-all text-sm font-mono text-gray-800 mb-3">
                  {bitcoinAddress}
                </div>
                <button
                  onClick={() => copyToClipboard(bitcoinAddress)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copiedAddress ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Address
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Payment Instructions */}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  {paymentMethod === 'lightning' 
                    ? 'Send the exact amount using any Lightning-enabled wallet'
                    : `Send exactly ${amount.toFixed(8)} BTC to this address`
                  }
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  {paymentMethod === 'lightning'
                    ? 'Payment will be confirmed instantly on the Lightning Network'
                    : 'Payment will be confirmed automatically on the blockchain'
                  }
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  {paymentMethod === 'lightning'
                    ? 'This invoice is unique and can only be used once'
                    : 'This address is unique to this invoice and can only be used once'
                  }
                </p>
              </div>
            </div>

            {/* Real-time Payment Info */}
            {paymentInfo && paymentMethod === 'bitcoin' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Payment Status</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Current Balance:</span>
                    <span className="font-mono text-blue-900">
                      {(Number(paymentInfo.balance) / 100000000).toFixed(8)} BTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Transactions:</span>
                    <span className="text-blue-900">{paymentInfo.utxos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span className={`font-medium ${
                      paymentInfo.hasPayment ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {paymentInfo.hasPayment ? 'Payment Received' : 'Awaiting Payment'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="text-center">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">QR Code</h4>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showQRCode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showQRCode ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showQRCode ? (
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                <img 
                  src={generateQRCode(
                    paymentMethod === 'lightning' 
                      ? lightningInvoice?.paymentRequest || ''
                      : `bitcoin:${bitcoinAddress}?amount=${amount}&label=${encodeURIComponent(`Invoice #${invoiceId}`)}&message=${encodeURIComponent(`Payment for ${freelancerName}`)}`,
                    `Invoice #${invoiceId}`
                  )} 
                  alt={`${paymentMethod === 'lightning' ? 'Lightning' : 'Bitcoin'} Payment QR Code`} 
                  className="w-64 h-64"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <QrCode className="h-16 w-16 text-gray-400" />
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-3">
              Scan with your {paymentMethod === 'lightning' ? 'Lightning' : 'Bitcoin'} wallet to pay
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleVerifyPayment}
              disabled={verifyPaymentMutation.isPending || paymentStatus === 'verifying' || paymentStatus === 'confirmed' || paymentMethod === 'lightning'}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {paymentStatus === 'verifying' ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Verifying Payment...
                </>
              ) : paymentStatus === 'confirmed' ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Payment Confirmed
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Verify Payment
                </>
              )}
            </button>
            
            <a
              href={paymentMethod === 'lightning' 
                ? 'https://lightning.network/'
                : `https://blockstream.info/testnet/address/${bitcoinAddress}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              View on {paymentMethod === 'lightning' ? 'Lightning Explorer' : 'Blockchain'}
            </a>
          </div>
        </div>

        {/* Error State */}
        {paymentStatus === 'failed' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-red-700 font-medium">Payment verification failed</p>
                <p className="text-red-600 text-sm mt-1">
                  Please ensure you've sent the correct amount and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {paymentStatus === 'confirmed' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-green-700 font-medium">Payment confirmed!</p>
                <p className="text-green-600 text-sm mt-1">
                  Your {paymentMethod === 'lightning' ? 'Lightning' : 'Bitcoin'} payment has been verified. The freelancer has been notified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Need Help?</h5>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• {paymentMethod === 'lightning' ? 'Use Lightning wallets like Phoenix, Breez, or Zeus' : 'Use Bitcoin wallets like Electrum, BlueWallet, or Coinbase Wallet'}</p>
            <p>• Make sure to send the exact amount: <strong>{amount.toFixed(8)} BTC</strong></p>
            <p>• {paymentMethod === 'lightning' ? 'Lightning payments are instant and have very low fees' : 'Payments are processed automatically once confirmed on the blockchain'}</p>
            <p>• Contact {freelancerName} if you have any questions about this invoice</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionBitcoinPayment;
