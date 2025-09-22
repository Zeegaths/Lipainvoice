import React from 'react';
import { TrendingUp, Bitcoin, Zap, Clock, CheckCircle, AlertCircle, DollarSign, Activity } from 'lucide-react';

interface PaymentAnalyticsProps {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  bitcoinPayments: number;
  lightningPayments: number;
  averagePaymentTime: number;
}

const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({
  totalInvoices,
  paidInvoices,
  pendingInvoices,
  totalRevenue,
  bitcoinPayments,
  lightningPayments,
  averagePaymentTime
}) => {
  const paymentSuccessRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
  const bitcoinPercentage = (bitcoinPayments + lightningPayments) > 0 ? (bitcoinPayments / (bitcoinPayments + lightningPayments)) * 100 : 0;
  const lightningPercentage = 100 - bitcoinPercentage;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Activity className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">Payment Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Payment Success Rate */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Success Rate</p>
              <p className="text-2xl font-bold text-blue-900">
                {paymentSuccessRate.toFixed(1)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Average Payment Time */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Avg Payment Time</p>
              <p className="text-2xl font-bold text-purple-900">
                {averagePaymentTime}m
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Total Invoices</p>
              <p className="text-2xl font-bold text-orange-900">
                {totalInvoices}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Distribution</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Bitcoin className="h-5 w-5 text-orange-600 mr-2" />
                <span className="font-medium text-gray-900">Bitcoin (On-Chain)</span>
              </div>
              <span className="text-sm text-gray-600">{bitcoinPayments} payments</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${bitcoinPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{bitcoinPercentage.toFixed(1)}% of total payments</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-medium text-gray-900">Lightning Network</span>
              </div>
              <span className="text-sm text-gray-600">{lightningPayments} payments</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${lightningPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{lightningPercentage.toFixed(1)}% of total payments</p>
          </div>
        </div>
      </div>

      {/* Invoice Status Overview */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-700">Paid</p>
                <p className="text-2xl font-bold text-green-900">{paidInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-700">Failed</p>
                <p className="text-2xl font-bold text-red-900">{totalInvoices - paidInvoices - pendingInvoices}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalytics;
