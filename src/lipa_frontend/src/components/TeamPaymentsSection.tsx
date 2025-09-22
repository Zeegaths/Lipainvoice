import { useInternetIdentity } from 'ic-use-internet-identity';
import { useState } from 'react';
import { Users, DollarSign, Clock, CheckCircle, AlertCircle, Eye, X } from 'lucide-react';
import { useInvoices } from '../hooks/useQueries';

interface TeamPayment {
  invoiceId: bigint;
  projectTitle: string;
  totalAmount: number;
  userShare: number;
  userPercentage: number;
  paymentStatus: 'pending' | 'received' | 'distributed';
  createdAt: string;
  clientName: string;
  teamMembers: Array<{
    walletAddress: string;
    percentage: number;
    amount: number;
  }>;
}

const TeamPaymentsSection = () => {
  const { identity } = useInternetIdentity();
  const [selectedPayment, setSelectedPayment] = useState<TeamPayment | null>(null);
  const { data: invoices = [], isLoading } = useInvoices();

  // Parse team payment data from invoices
  const teamPayments: TeamPayment[] = invoices
    .map(([id, details]) => {
      try {
        const parsed = JSON.parse(details);
        if (parsed.useTeamSplit && parsed.teamMembers && parsed.teamMembers.length > 0) {
          const userPrincipal = identity?.getPrincipal().toString();
          const userMember = parsed.teamMembers.find((member: any) => 
            member.walletAddress === userPrincipal || member.principalId === userPrincipal
          );
          
          if (userMember) {
            return {
              invoiceId: id,
              projectTitle: parsed.projectTitle || 'Untitled Project',
              totalAmount: parsed.totalBtc || 0,
              userShare: (parsed.totalBtc || 0) * (userMember.percentage / 100),
              userPercentage: userMember.percentage,
              paymentStatus: parsed.paymentStatus || 'pending',
              createdAt: parsed.createdAt || new Date().toISOString(),
              clientName: parsed.clientName || 'Unknown Client',
              teamMembers: parsed.teamMembers.map((member: any) => ({
                walletAddress: member.walletAddress,
                percentage: member.percentage,
                amount: (parsed.totalBtc || 0) * (member.percentage / 100)
              }))
            };
          }
        }
        return null;
      } catch {
        return null;
      }
    })
    .filter((payment): payment is TeamPayment => payment !== null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'distributed': return 'bg-green-500 text-white shadow-sm';
      case 'received': return 'bg-blue-500 text-white shadow-sm';
      default: return 'bg-orange-500 text-white shadow-sm';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'distributed': return CheckCircle;
      case 'received': return Clock;
      default: return AlertCircle;
    }
  };

  const totalEarnings = teamPayments.reduce((sum, payment) => sum + payment.userShare, 0);
  const pendingEarnings = teamPayments
    .filter(p => p.paymentStatus === 'pending')
    .reduce((sum, payment) => sum + payment.userShare, 0);
  const receivedEarnings = teamPayments
    .filter(p => p.paymentStatus === 'received' || p.paymentStatus === 'distributed')
    .reduce((sum, payment) => sum + payment.userShare, 0);

  if (!identity) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Team Payment Shares</h3>
          <p className="text-sm text-gray-500">Please log in to view your team payments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-bold text-gray-900">Team Payment Shares</h2>
            <p className="text-sm text-gray-600">{teamPayments.length} team invoices</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-lg font-bold text-gray-900">{totalEarnings.toFixed(2)} BTC</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Pending</p>
                <p className="text-lg font-bold text-orange-800">{pendingEarnings.toFixed(2)} BTC</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Received</p>
                <p className="text-lg font-bold text-green-800">{receivedEarnings.toFixed(2)} BTC</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading team payments...</p>
          </div>
        ) : teamPayments.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Payments Yet</h3>
            <p className="text-gray-500 text-sm">You'll see your payment shares from team invoices here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teamPayments.map((payment) => {
              const StatusIcon = getStatusIcon(payment.paymentStatus);
              return (
                <div key={payment.invoiceId.toString()} className="bg-gray-50 rounded-lg p-4 border border-gray-300 hover:shadow-sm transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-md font-bold text-gray-900">{payment.projectTitle}</h4>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                          {payment.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Client: {payment.clientName}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm mb-3 sm:mb-0">
                          <span className="text-gray-600">Your share: <span className="font-semibold text-gray-900">{payment.userPercentage}%</span></span>
                          <span className="font-bold text-purple-600">
                            {payment.userShare.toFixed(2)} BTC
                          </span>
                          <span className="text-gray-500">of {payment.totalAmount.toFixed(2)} BTC total</span>
                        </div>
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="flex items-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-md transition-all duration-200 text-sm font-medium w-fit"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-bold text-gray-900 mb-2">{selectedPayment.projectTitle}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Invoice ID</p>
                      <p className="font-semibold text-gray-900">#{selectedPayment.invoiceId.toString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Client</p>
                      <p className="font-semibold text-gray-900">{selectedPayment.clientName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedPayment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.paymentStatus)}`}>
                        {selectedPayment.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <h5 className="font-bold text-purple-900 mb-3">Your Payment Share</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-purple-700 mb-1">Percentage</p>
                      <p className="text-xl font-bold text-purple-900">{selectedPayment.userPercentage}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-purple-700 mb-1">Amount</p>
                      <p className="text-xl font-bold text-purple-900">{selectedPayment.userShare.toFixed(2)} BTC</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-gray-900 mb-4">Team Split Breakdown</h5>
                  <div className="space-y-3">
                    {selectedPayment.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-sm text-gray-600 font-mono">
                            {member.walletAddress.slice(0, 8)}...{member.walletAddress.slice(-6)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{member.percentage}%</p>
                          <p className="text-xs text-gray-600">{member.amount.toFixed(8)} BTC</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border-t-4 border-purple-500">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Invoice Amount</span>
                    <span className="text-xl font-bold text-gray-900">{selectedPayment.totalAmount.toFixed(8)} BTC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPaymentsSection;