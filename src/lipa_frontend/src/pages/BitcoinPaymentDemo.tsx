import React, { useState } from 'react';
import { Bitcoin, ArrowLeft, ExternalLink } from 'lucide-react';
import ProductionBitcoinPayment from '../components/ProductionBitcoinPayment';

const BitcoinPaymentDemo: React.FC = () => {
  const [demoInvoice, setDemoInvoice] = useState({
    id: BigInt(12345),
    amount: 0.001, // 0.001 BTC
    clientName: 'John Doe',
    freelancerName: 'Alice Smith',
  });

  const handlePaymentConfirmed = () => {
    console.log('Payment confirmed for invoice:', demoInvoice.id);
    // Here you would typically update the invoice status in your backend
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Bitcoin className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bitcoin Payment Demo</h1>
                <p className="text-sm text-gray-600">Professional Bitcoin invoice payment system</p>
              </div>
            </div>
            <a
              href="/"
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Demo Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Demo Invoice</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-medium">Invoice ID:</p>
              <p className="text-blue-900 font-mono">#{demoInvoice.id.toString()}</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Amount:</p>
              <p className="text-blue-900 font-mono">{demoInvoice.amount} BTC</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Client:</p>
              <p className="text-blue-900">{demoInvoice.clientName}</p>
            </div>
          </div>
          <p className="text-blue-600 text-sm mt-4">
            This is a demonstration of our Bitcoin payment invoice system. The system generates unique Bitcoin addresses for each invoice and provides real-time payment monitoring.
          </p>
        </div>

        {/* Production Bitcoin Payment Component */}
        <ProductionBitcoinPayment
          invoiceId={demoInvoice.id}
          amount={demoInvoice.amount}
          clientName={demoInvoice.clientName}
          freelancerName={demoInvoice.freelancerName}
          onPaymentConfirmed={handlePaymentConfirmed}
        />

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Unique Bitcoin address generation for each invoice</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Real-time payment monitoring and verification</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>QR code generation for easy mobile payments</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Automatic payment confirmation on blockchain</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Professional payment interface</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-gray-900">Generate Address</p>
                  <p className="text-sm text-gray-600">System creates a unique Bitcoin address for the invoice</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-gray-900">Client Pays</p>
                  <p className="text-sm text-gray-600">Client sends Bitcoin to the generated address</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-gray-900">Monitor Payment</p>
                  <p className="text-sm text-gray-600">System monitors blockchain for payment confirmation</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">4</div>
                <div>
                  <p className="font-medium text-gray-900">Confirm Payment</p>
                  <p className="text-sm text-gray-600">Payment is automatically verified and confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Implementation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Backend (Motoko)</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Bitcoin address generation using P2PKH/P2TR</li>
                <li>• Real-time blockchain monitoring</li>
                <li>• Payment verification and confirmation</li>
                <li>• Secure key management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Frontend (React)</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Professional payment interface</li>
                <li>• QR code generation</li>
                <li>• Real-time status updates</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Want to see this in action?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://blockstream.info/testnet/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Bitcoin Testnet Explorer
            </a>
            <a
              href="/invoice-creation"
              className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Bitcoin className="h-4 w-4 mr-2" />
              Create New Invoice
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinPaymentDemo;
