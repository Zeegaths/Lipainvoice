import { useState } from 'react';
import { ArrowLeft, Users, DollarSign, Clock, CheckCircle, AlertCircle, Eye, Filter, Search } from 'lucide-react';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useInvoices } from '../hooks/useQueries';
import { Page } from '../App';

interface TeamPaymentsProps {
  onNavigate: (page: Page) => void;
}

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

const TeamPayments = ({ onNavigate }: TeamPaymentsProps) => {
  const { identity } = useInternetIdentity();
  const { data: invoices = [], isLoading } = useInvoices();
  const [selectedPayment, setSelectedPayment] = useState<TeamPayment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter payments
  const filteredPayments = teamPayments.filter(payment => {
    const matchesSearch = payment.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || payment.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'distributed': return 'bg-green-100 text-green-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Team Payment Tracking</h1>
        <p className="text-gray-600">Monitor your payment shares from team invoices</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">{totalEarnings.toFixed(8)} BTC</p>
              <p className="text-sm text-gray-500">{teamPayments.length} team invoices</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingEarnings.toFixed(8)} BTC</p>
              <p className="text-sm text-gray-500">
                {teamPayments.filter(p => p.paymentStatus === 'pending').length} invoices
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Received Payments</p>
              <p className="text-2xl font-semibold text-gray-900">{receivedEarnings.toFixed(8)} BTC</p>
              <p className="text-sm text-gray-500">
                {teamPayments.filter(p => p.paymentStatus === 'received' || p.paymentStatus === 'distributed').length} invoices
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="distributed">Distributed</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment History ({filteredPayments.length})
          </h3>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'All' ? 'No payments match your filters' : 'No team payments yet'}
              </p>
              <p className="text-sm text-gray-400">
                {searchTerm || statusFilter !== 'All' ? 'Try adjusting your search or filters' : 'You\'ll see your payment shares from team invoices here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => {
                const StatusIcon = getStatusIcon(payment.paymentStatus);
                return (
                  <div key={payment.invoiceId.toString()} className="p-6 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-lg font-medium text-gray-900">{payment.projectTitle}</h4>
                          <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                            <StatusIcon className="h-4 w-4 inline mr-1" />
                            {payment.paymentStatus}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Client</p>
                            <p className="font-medium text-gray-900">{payment.clientName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Your Share</p>
                            <p className="font-medium text-purple-600">{payment.userPercentage}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Your Amount</p>
                            <p className="font-medium text-gray-900">{payment.userShare.toFixed(8)} BTC</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Invoice</p>
                            <p className="font-medium text-gray-900">{payment.totalAmount.toFixed(8)} BTC</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            Created: {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="flex items-center px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
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
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Invoice Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Invoice Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice ID:</span>
                        <span className="font-medium">#{selectedPayment.invoiceId.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project:</span>
                        <span className="font-medium">{selectedPayment.projectTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Client:</span>
                        <span className="font-medium">{selectedPayment.clientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{new Date(selectedPayment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Your Payment Share</h4>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Percentage:</span>
                          <span className="font-semibold text-purple-900">{selectedPayment.userPercentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Amount:</span>
                          <span className="font-semibold text-purple-900">{selectedPayment.userShare.toFixed(8)} BTC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Status:</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPayment.paymentStatus)}`}>
                            {selectedPayment.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Split Breakdown */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Team Split Breakdown</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {selectedPayment.teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 break-all">
                              {member.walletAddress.slice(0, 12)}...{member.walletAddress.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-500">Team Member {index + 1}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-semibold text-gray-900">{member.percentage}%</p>
                            <p className="text-xs text-gray-600">{member.amount.toFixed(8)} BTC</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total Summary */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Invoice Amount</span>
                    <span className="text-xl font-bold text-gray-900">{selectedPayment.totalAmount.toFixed(8)} BTC</span>
                  </div>
                </div>

                {/* Verification Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h5 className="font-medium text-blue-900">Trustless Verification</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        All payment split data is stored on-chain and can be independently verified. 
                        The allocation percentages and amounts are immutable once the invoice is created.
                      </p>
                    </div>
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

export default TeamPayments;
