import React from 'react';
import { AlertCircle, RefreshCw, ExternalLink, Shield, Clock } from 'lucide-react';

interface PaymentErrorHandlerProps {
  error: Error | null;
  errorType: 'network' | 'payment' | 'verification' | 'timeout' | 'unknown';
  onRetry?: () => void;
  onContactSupport?: () => void;
}

const PaymentErrorHandler: React.FC<PaymentErrorHandlerProps> = ({
  error,
  errorType,
  onRetry,
  onContactSupport
}) => {
  if (!error) return null;

  const getErrorDetails = () => {
    switch (errorType) {
      case 'network':
        return {
          title: 'Network Connection Error',
          description: 'Unable to connect to the Bitcoin network. Please check your internet connection.',
          icon: AlertCircle,
          color: 'red',
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Wait a few minutes and try again'
          ]
        };
      case 'payment':
        return {
          title: 'Payment Processing Error',
          description: 'There was an issue processing your payment. Please verify the transaction details.',
          icon: AlertCircle,
          color: 'red',
          suggestions: [
            'Verify the Bitcoin address is correct',
            'Ensure you have sufficient balance',
            'Check if the payment amount matches exactly'
          ]
        };
      case 'verification':
        return {
          title: 'Payment Verification Failed',
          description: 'We could not verify your payment on the blockchain. This may be due to network congestion.',
          icon: Shield,
          color: 'yellow',
          suggestions: [
            'Wait for more blockchain confirmations',
            'Check the transaction on a blockchain explorer',
            'Contact support if the issue persists'
          ]
        };
      case 'timeout':
        return {
          title: 'Payment Timeout',
          description: 'The payment verification timed out. This usually means the network is slow.',
          icon: Clock,
          color: 'yellow',
          suggestions: [
            'Wait a few more minutes',
            'Check the blockchain explorer',
            'Try refreshing the payment status'
          ]
        };
      default:
        return {
          title: 'Unexpected Error',
          description: 'An unexpected error occurred. Please try again or contact support.',
          icon: AlertCircle,
          color: 'red',
          suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Contact support if the problem continues'
          ]
        };
    }
  };

  const errorDetails = getErrorDetails();
  const IconComponent = errorDetails.icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${errorDetails.color}-100 mb-4`}>
          <IconComponent className={`h-8 w-8 text-${errorDetails.color}-600`} />
        </div>
        
        <h3 className={`text-xl font-semibold text-${errorDetails.color}-900 mb-2`}>
          {errorDetails.title}
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {errorDetails.description}
        </p>

        {/* Error Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-gray-900 mb-2">Error Details:</h4>
          <p className="text-sm text-gray-600 font-mono break-all">
            {error.message}
          </p>
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">What you can do:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {errorDetails.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <div className={`w-2 h-2 bg-${errorDetails.color}-500 rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          )}
          
          <button
            onClick={() => window.open('https://blockstream.info/testnet/', '_blank')}
            className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Blockchain
          </button>
          
          {onContactSupport && (
            <button
              onClick={onContactSupport}
              className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Shield className="h-4 w-4 mr-2" />
              Contact Support
            </button>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Need More Help?</h5>
          <p className="text-sm text-blue-700">
            If you continue to experience issues, please contact our support team with the error details above.
            We're here to help resolve any payment problems quickly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorHandler;
