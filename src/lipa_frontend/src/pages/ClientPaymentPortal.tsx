import { useState, useEffect } from 'react';
import { Bitcoin, Download, Star, Send, CheckCircle, Clock, AlertCircle, FileText, Paperclip, ArrowLeft, Award, Trophy, Shield } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createActor } from '../../../declarations/lipa_backend';
import FileList from '../components/FileList';

interface ClientPaymentPortalProps {
  invoiceId: string;
  onBack: () => void;
}

interface InvoiceData {
  id: bigint;
  clientName: string;
  projectTitle: string;
  projectDescription: string;
  totalBtc: number;
  totalUsd: number;
  effectiveHours: number;
  ratePerHour: string;
  bitcoinAddress: string;
  status: 'pending' | 'paid' | 'distributed';
  createdAt: string;
  selectedTasks?: string[];
  teamMembers?: Array<{
    walletAddress: string;
    percentage: number;
    amount: number;
  }>;
  useTeamSplit?: boolean;
  files?: Array<{
    name: string;
    path: string;
    size: bigint;
    mimeType: string;
    uploadedAt: bigint;
  }>;
  freelancerPrincipal?: string;
}

interface TaskData {
  title: string;
  description: string;
  timeSpent: { hours: number; minutes: number };
}

interface FreelancerProfile {
  badges: Array<[string, string]>;
  overallRating: number;
  totalReviews: number;
  completedProjects: number;
  experienceLevel: string;
}

const ClientPaymentPortal = ({ invoiceId, onBack }: ClientPaymentPortalProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'confirmed' | 'failed'>('pending');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [btcToUsd] = useState(45000); // Mock BTC to USD rate

  // Fetch invoice data
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['client-invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) throw new Error('Invoice ID is required');
      
      const actor = await createActor();
      const invoiceData = await actor.getInvoice(BigInt(invoiceId));
      
      if (!invoiceData) {
        throw new Error('Invoice not found');
      }

      try {
        const parsedDetails = JSON.parse(invoiceData.details);
        return {
          id: invoiceData.id,
          ...parsedDetails,
          files: invoiceData.files
        } as InvoiceData;
      } catch {
        throw new Error('Invalid invoice data');
      }
    },
    enabled: !!invoiceId,
  });

  // Fetch freelancer profile data
  const { data: freelancerProfile } = useQuery({
    queryKey: ['freelancer-profile', invoice?.freelancerPrincipal],
    queryFn: async () => {
      if (!invoice?.freelancerPrincipal) return null;
      
      // Mock freelancer profile data - in real implementation, this would fetch from backend
      const mockProfile: FreelancerProfile = {
        badges: [
          ['Expert Developer', 'Demonstrated expertise in software development'],
          ['Reliable Partner', 'Consistently delivers projects on time'],
          ['Client Favorite', 'Highly rated by previous clients'],
          ['Bitcoin Specialist', 'Specialized in cryptocurrency and blockchain projects'],
          ['Quality Assurance', 'Maintains high standards in all deliverables']
        ],
        overallRating: 4.8,
        totalReviews: 47,
        completedProjects: 156,
        experienceLevel: 'Expert'
      };
      
      return mockProfile;
    },
    enabled: !!invoice?.freelancerPrincipal,
  });

  // Mock Bitcoin payment verification
  const verifyPaymentMutation = useMutation({
    mutationFn: async () => {
      // Simulate payment verification delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock verification result (in real implementation, this would use ICP Chain Fusion)
      const isPaymentValid = Math.random() > 0.2; // 80% success rate for demo
      
      if (!isPaymentValid) {
        throw new Error('Payment verification failed');
      }
      
      return { verified: true, transactionId: 'mock_tx_' + Date.now() };
    },
    onMutate: () => {
      setPaymentStatus('verifying');
    },
    onSuccess: () => {
      setPaymentStatus('confirmed');
      setShowRatingForm(true);
    },
    onError: () => {
      setPaymentStatus('failed');
    },
  });

  // Submit rating and review
  const submitReviewMutation = useMutation({
    mutationFn: async ({ rating, review }: { rating: number; review: string }) => {
      // Mock review submission (in real implementation, this would call backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      setShowRatingForm(false);
      alert('Thank you for your feedback!');
    },
  });

  const handlePayment = () => {
    verifyPaymentMutation.mutate();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      submitReviewMutation.mutate({ rating, review });
    }
  };

  const formatTime = (timeSpent: { hours: number; minutes: number }) => {
    const { hours, minutes } = timeSpent;
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const generateQRCode = (address: string, amount: number) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:${address}?amount=${amount}`;
  };

  const getBadgeIcon = (badgeName: string) => {
    if (badgeName.toLowerCase().includes('expert') || badgeName.toLowerCase().includes('specialist')) {
      return Trophy;
    }
    if (badgeName.toLowerCase().includes('reliable') || badgeName.toLowerCase().includes('quality')) {
      return Shield;
    }
    return Award;
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
                <p className="text-sm text-gray-600">Invoice #{invoice.id.toString()}</p>
              </div>
            </div>
            {paymentStatus === 'confirmed' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Payment Confirmed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Freelancer Profile Section */}
        {freelancerProfile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Freelancer Profile</h2>
                  <p className="text-gray-600">Professional achievements and client feedback</p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="ml-1 text-xl font-bold text-gray-900">{freelancerProfile.overallRating}</span>
                  </div>
                  <p className="text-sm text-gray-600">{freelancerProfile.totalReviews} reviews</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{freelancerProfile.completedProjects}</p>
                  <p className="text-sm text-gray-600">Projects completed</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <span className={`px-3 py-1 text-sm rounded-full ${getExperienceLevelColor(freelancerProfile.experienceLevel)}`}>
                    {freelancerProfile.experienceLevel}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">Experience level</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{freelancerProfile.badges.length}</p>
                  <p className="text-sm text-gray-600">Achievement badges</p>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Professional Badges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freelancerProfile.badges.map(([name, description], index) => {
                    const IconComponent = getBadgeIcon(name);
                    return (
                      <div key={index} className="flex items-start p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                          <IconComponent className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Client Testimonials Preview */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What clients say:</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-blue-700 ml-2">"Exceptional work quality and communication"</p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-blue-700 ml-2">"Delivered ahead of schedule with perfect results"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            {/* Invoice Header */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-gray-600 mt-2">Bitcoin Payment Invoice</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Invoice Date</p>
                  <p className="font-semibold">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client & Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                <p className="text-gray-700">{invoice.clientName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Project:</h3>
                <p className="text-gray-700 font-medium">{invoice.projectTitle}</p>
                <p className="text-sm text-gray-600 mt-1">{invoice.projectDescription}</p>
              </div>
            </div>

            {/* Work Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Work Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Hours Worked</p>
                  <p className="text-xl font-semibold">{invoice.effectiveHours.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rate per Hour</p>
                  <p className="text-xl font-semibold">{invoice.ratePerHour} BTC</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-orange-600">{invoice.totalBtc.toFixed(8)} BTC</p>
                  <p className="text-sm text-gray-600">≈ ${(invoice.totalBtc * btcToUsd).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Team Split (if applicable) */}
            {invoice.useTeamSplit && invoice.teamMembers && invoice.teamMembers.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Distribution:</h3>
                <div className="space-y-2">
                  {invoice.teamMembers.map((member, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600 break-all">
                        {member.walletAddress.slice(0, 8)}...{member.walletAddress.slice(-6)}
                      </span>
                      <span className="font-semibold">
                        {member.percentage}% ({member.amount.toFixed(8)} BTC)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Files */}
            {invoice.files && invoice.files.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Supporting Documents:</h3>
                <FileList files={invoice.files} />
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        {paymentStatus !== 'confirmed' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Bitcoin className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">Bitcoin Payment</h3>
                  <p className="text-gray-600">Send payment to the address below</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Payment Address:</h4>
                  <div className="bg-gray-100 p-4 rounded-lg break-all text-sm font-mono mb-4">
                    {invoice.bitcoinAddress}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Amount:</strong> {invoice.totalBtc.toFixed(8)} BTC</p>
                    <p><strong>USD Equivalent:</strong> ~${(invoice.totalBtc * btcToUsd).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-3">QR Code:</h4>
                  <img 
                    src={generateQRCode(invoice.bitcoinAddress, invoice.totalBtc)} 
                    alt="Bitcoin Payment QR Code" 
                    className="mx-auto border rounded-lg shadow-sm"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handlePayment}
                    disabled={verifyPaymentMutation.isPending || paymentStatus === 'verifying'}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentStatus === 'verifying' ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying Payment...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        I've Sent the Payment
                      </>
                    )}
                  </button>
                </div>
                
                {paymentStatus === 'failed' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-red-700">
                        Payment verification failed. Please ensure you've sent the correct amount to the specified address and try again.
                      </p>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Click "I've Sent the Payment" after sending Bitcoin to verify your transaction on the blockchain.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Confirmation */}
        {paymentStatus === 'confirmed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">Payment Confirmed!</h3>
              <p className="text-green-700 mb-4">
                Your Bitcoin payment has been successfully verified and recorded on the blockchain.
              </p>
              <p className="text-sm text-green-600">
                The freelancer has been notified of your payment. Thank you for your business!
              </p>
            </div>
          </div>
        )}

        {/* Rating and Review Form */}
        {showRatingForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">Rate Your Experience</h3>
                  <p className="text-gray-600">Help other clients by sharing your feedback</p>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Overall Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 rounded transition-colors ${
                          star <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-3 text-sm text-gray-600">
                        {rating} out of 5 stars
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review (Optional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Share your experience working with this freelancer..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {review.length}/500 characters
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={rating === 0 || submitReviewMutation.isPending}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitReviewMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRatingForm(false)}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Skip for Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          © 2025. Built with <span className="text-red-500">♥</span> using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ClientPaymentPortal;
