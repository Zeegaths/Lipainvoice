import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import FileList from '../components/FileList';
import { useInvoiceById } from '../hooks/useQueries';
import { useToast } from '../components/ToastContainer';

interface ClientPaymentPortalProps {
  invoiceId: string;
  onBack: () => void;
}


const ClientPaymentPortal = ({ invoiceId, onBack }: ClientPaymentPortalProps) => {
  const { data:invoice, isLoading, error } = useInvoiceById(BigInt(invoiceId));
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'confirmed' | 'failed'>('pending');
  const [btcToUsd] = useState(115000);
  const { showToast } = useToast();

  const handlePayment = () => {
    console.log('handlePayment');
    showToast({
      title: 'Payment initiated',
      message: 'Payment initiated',
      type: 'success',
    });
  };

  const generateQRCode = (address: string, amount: number) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:${address}?amount=${amount}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">An error occurred while loading the invoice.</p>
          <p className="text-gray-600 mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-4">The requested invoice could not be found or has been removed.</p>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 max-w-4xl mx-auto px-6 py-4" >
      <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-blue-600 hover:text-blue-700 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Invoice Payment</h1>
                <p className="text-sm text-gray-600">INV-#{invoice.id.toString().slice(0, 8)}...</p>
              </div>
            </div>
            {paymentStatus === 'confirmed' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Payment Confirmed</span>
              </div>
            )}
      </div>

        <div className="bg-white rounded-3xl mt-12 shadow-sm border border-gray-300">
          <div className="p-8">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-gray-600 mt-2">Bitcoin Payment Invoice</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Invoice Date</p>
                  <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      invoice.details.Status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.details.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {invoice.details.Status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                <p className="text-gray-700">{invoice.details.Client}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Project:</h3>
                <p className="text-gray-700 font-medium">{invoice.details.Project}</p>
                {invoice.details.Description && (
                  <p className="text-sm text-gray-600 mt-1">{invoice.details.Description}</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Work Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                {invoice.details.Hours && (
                  <div>
                    <p className="text-sm text-gray-600">Hours Worked</p>
                    <p className="text-xl font-semibold">{invoice.details.Hours}</p>
                  </div>
                )}
                {invoice.details.Rate && (
                  <div>
                    <p className="text-sm text-gray-600">Rate per Hour</p>
                    <p className="text-xl font-semibold">{invoice.details.Rate} BTC</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-orange-600">≈ ${invoice.details.Amount} USD</p>
                  <p className="text-sm text-gray-600">{(parseFloat(invoice.details.Amount) / btcToUsd).toLocaleString()} BTC</p>
                </div>
              </div>
            </div>
            {invoice.files && invoice.files.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Supporting Documents:</h3>
                <FileList files={invoice.files} />
              </div>
            )}
          </div>
      </div>
      <button onClick={handlePayment} className="bg-blue-500 mt-4 text-white px-4 py-2 rounded-xl w-full md:w-1/2">Pay Now</button>
    </div>
  );
};

export default ClientPaymentPortal;
