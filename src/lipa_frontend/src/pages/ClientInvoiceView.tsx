import { useState, useEffect } from 'react';
import { Bitcoin, Download, Star, CheckCircle, Clock, AlertCircle, FileText, Paperclip, Award, Trophy, Shield, User, ExternalLink, QrCode, Copy, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createActor } from '../../../declarations/lipa_backend';
import FileList from '../components/FileList';

interface ClientInvoiceViewProps {
  invoiceId: string;
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
  displayName: string;
  professionalTitle: string;
  bio: string;
  profilePhoto?: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
    website: string;
  };
  badges: Array<[string, string]>;
  overallRating: number;
  totalReviews: number;
  completedProjects: number;
  experienceLevel: string;
}

const ClientInvoiceView = ({ invoiceId }: ClientInvoiceViewProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'confirmed' | 'failed'>('pending');
  const [showQRCode, setShowQRCode] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [btcToUsd] = useState(45000); // Mock BTC to USD rate

  // Fetch invoice data
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['public-invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) throw new Error('Invoice ID is required');
      
      const actor = await createActor(import.meta.env.VITE_LIPA_BACKEND_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai');
      const invoiceData = await actor.getInvoice(BigInt(invoiceId));
      
      if (!invoiceData || (Array.isArray(invoiceData) && invoiceData.length === 0)) {
        throw new Error('Invoice not found');
      }

      try {
        // Handle the case where invoiceData is [Invoice] or []
        const invoiceItem = Array.isArray(invoiceData) ? invoiceData[0] : invoiceData;
        if (!invoiceItem) {
          throw new Error('Invoice not found');
        }
        
        const parsedDetails = JSON.parse(invoiceItem.details);
        return {
          id: invoiceItem.id,
          ...parsedDetails,
          files: invoiceItem.files
        } as InvoiceData;
      } catch {
        throw new Error('Invalid invoice data');
      }
    },
    enabled: !!invoiceId,
  });

  // Fetch freelancer profile data
  const { data: freelancerProfile } = useQuery({
    queryKey: ['public-freelancer-profile', invoice?.freelancerPrincipal],
    queryFn: async () => {
      if (!invoice?.freelancerPrincipal) return null;
      
      // Mock freelancer profile data - in real implementation, this would fetch from backend
      const mockProfile: FreelancerProfile = {
        displayName: 'Alex Johnson',
        professionalTitle: 'Senior Full Stack Developer',
        bio: 'Experienced developer specializing in blockchain applications and modern web technologies. Passionate about creating efficient, scalable solutions for complex business problems.',
        profilePhoto: undefined,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/alexjohnson',
          twitter: 'https://twitter.com/alexjohnsondev',
          github: 'https://github.com/alexjohnson',
          website: 'https://alexjohnson.dev'
        },
        badges: [
          ['Expert Developer', JSON.stringify({ description: 'Demonstrated expertise in software development', category: 'Technical Excellence', earnedAt: '2024-12-15' })],
          ['Reliable Partner', JSON.stringify({ description: 'Consistently delivers projects on time', category: 'Client Relations', earnedAt: '2024-11-20' })],
          ['Client Favorite', JSON.stringify({ description: 'Highly rated by previous clients', category: 'Client Relations', earnedAt: '2024-10-10' })],
          ['Bitcoin Specialist', JSON.stringify({ description: 'Specialized in cryptocurrency and blockchain projects', category: 'Specialization', earnedAt: '2024-09-05' })],
          ['Quality Assurance', JSON.stringify({ description: 'Maintains high standards in all deliverables', category: 'Technical Excellence', earnedAt: '2024-08-15' })]
        ],
        overallRating: 4.9,
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
    },
    onError: () => {
      setPaymentStatus('failed');
    },
  });

  const handleMarkAsPaid = () => {
    verifyPaymentMutation.mutate();
  };

  const formatTime = (timeSpent: { hours: number; minutes: number }) => {
    const { hours, minutes } = timeSpent;
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const generateQRCode = (address: string, amount: number) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=bitcoin:${address}?amount=${amount}`;
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
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">
            The requested invoice could not be found or may have been removed. 
            Please check the link and try again.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              If you believe this is an error, please contact the freelancer who sent you this link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoice Payment</h1>
              <p className="text-sm text-gray-600">Invoice #{invoice.id.toString()}</p>
              {paymentStatus === 'confirmed' && (
                <div className="flex items-center text-green-600 mt-2">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Payment Confirmed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Freelancer Profile Section */}
        {freelancerProfile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Freelancer Profile</h2>
                  <p className="text-gray-600">Professional achievements and expertise</p>
                </div>
              </div>

              {/* Freelancer Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                <div className="flex items-center mb-4 sm:mb-0">
                  {freelancerProfile.profilePhoto ? (
                    <img
                      src={freelancerProfile.profilePhoto}
                      alt={freelancerProfile.displayName}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">{freelancerProfile.displayName}</h3>
                    <p className="text-gray-600">{freelancerProfile.professionalTitle}</p>
                    <span className={`inline-block px-3 py-1 text-sm rounded-full mt-1 ${getExperienceLevelColor(freelancerProfile.experienceLevel)}`}>
                      {freelancerProfile.experienceLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {freelancerProfile.bio && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{freelancerProfile.bio}</p>
                </div>
              )}

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                  <p className="text-xl font-bold text-gray-900">{freelancerProfile.badges.length}</p>
                  <p className="text-sm text-gray-600">Achievement badges</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">5+</p>
                  <p className="text-sm text-gray-600">Years experience</p>
                </div>
              </div>

              {/* Badges */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Professional Badges</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freelancerProfile.badges.map(([name, description], index) => {
                    const IconComponent = getBadgeIcon(name);
                    let badgeData;
                    try {
                      badgeData = JSON.parse(description);
                    } catch {
                      badgeData = { description, category: 'General' };
                    }
                    
                    return (
                      <div key={index} className="flex items-start p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                          <IconComponent className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{badgeData.description}</p>
                          {badgeData.earnedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Earned: {new Date(badgeData.earnedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social Links */}
              {Object.values(freelancerProfile.socialLinks).some(link => link) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Connect</h4>
                  <div className="flex flex-wrap gap-3">
                    {freelancerProfile.socialLinks.linkedin && (
                      <a
                        href={freelancerProfile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    )}
                    {freelancerProfile.socialLinks.github && (
                      <a
                        href={freelancerProfile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    )}
                    {freelancerProfile.socialLinks.website && (
                      <a
                        href={freelancerProfile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Client Testimonials Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-3">What clients say:</h5>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex text-yellow-500 mr-3 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">"Exceptional work quality and communication. Delivered exactly what we needed on time."</p>
                      <p className="text-xs text-blue-600 mt-1">- TechCorp</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex text-yellow-500 mr-3 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">"Outstanding developer with deep blockchain expertise. Highly recommended!"</p>
                      <p className="text-xs text-blue-600 mt-1">- CryptoStartup</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 sm:p-8">
            {/* Invoice Header */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-gray-600 mt-2">Bitcoin Payment Invoice</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:text-right">
                  <p className="text-sm text-gray-600">Invoice Date</p>
                  <p className="font-semibold">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {paymentStatus === 'confirmed' ? 'paid' : invoice.status}
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

            {/* Task Summary */}
            {invoice.selectedTasks && invoice.selectedTasks.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Work Summary:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {invoice.selectedTasks.map((taskId, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium text-gray-900">Task #{taskId}</p>
                          <p className="text-sm text-gray-600">Development work completed</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">2.5h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Work Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
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
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {invoice.teamMembers.map((member, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded">
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
            <div className="p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Bitcoin className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">Bitcoin Payment</h3>
                  <p className="text-gray-600">Send payment to complete this invoice</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Payment Address:</h4>
                  <div className="bg-gray-100 p-4 rounded-lg break-all text-sm font-mono mb-4 relative">
                    {invoice.bitcoinAddress}
                    <button
                      onClick={() => copyToClipboard(invoice.bitcoinAddress)}
                      className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Amount:</strong> {invoice.totalBtc.toFixed(8)} BTC</p>
                    <p><strong>USD Equivalent:</strong> ~${(invoice.totalBtc * btcToUsd).toLocaleString()}</p>
                  </div>
                  
                  <button
                    onClick={() => setShowQRCode(!showQRCode)}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors sm:hidden"
                  >
                    {showQRCode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showQRCode ? 'Hide' : 'Show'} QR Code
                  </button>
                </div>
                
                <div className={`text-center ${showQRCode ? 'block' : 'hidden sm:block'}`}>
                  <h4 className="font-medium text-gray-900 mb-3">QR Code:</h4>
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <img 
                      src={generateQRCode(invoice.bitcoinAddress, invoice.totalBtc)} 
                      alt="Bitcoin Payment QR Code" 
                      className="w-48 h-48 sm:w-64 sm:h-64"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Scan with your Bitcoin wallet
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={verifyPaymentMutation.isPending || paymentStatus === 'verifying'}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {paymentStatus === 'verifying' ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying Payment...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Mark as Paid
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
                  Click "Mark as Paid" after sending Bitcoin to verify your transaction on the blockchain.
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
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-gray-500">
          © 2025. Built with <span className="text-red-500">♥</span> using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ClientInvoiceView;
