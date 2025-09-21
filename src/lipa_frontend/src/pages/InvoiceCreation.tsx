import { useState } from 'react';
import { Bitcoin, Users, QrCode, ArrowLeft, Plus, Trash2, CheckSquare, Paperclip, Loader2, CopyPlus } from 'lucide-react';
import { useAddInvoice, useInvoices } from '../hooks/useQueries';
import FileUpload from '../components/FileUpload';
import { useToast } from '../components/ToastContainer';
import { Page } from '../App';
import qrCode from '../../public/qrcode.png';
import { getEnvironment } from '../utils';

interface InvoiceCreationProps {
  onNavigate: (page: Page) => void;
}

interface TeamMember {
  id: string;
  walletAddress: string;
  percentage: number;
}

const baseLink = getEnvironment() === 'development' ? ' http://localhost:3000/?invoice=' : 'https://mpigd-gqaaa-aaaaj-qnsoq-cai.icp0.io/?invoice=';

interface Task {
  id: bigint;
  title: string;
  description: string;
  timeSpent: { hours: number; minutes: number };
  tags: string[];
  status: 'Pending' | 'In Progress' | 'Completed';
  invoiceId?: bigint;
  createdAt: string;
  updatedAt: string;
}

const InvoiceCreation = ({ onNavigate }: InvoiceCreationProps) => {
  const addInvoiceMutation = useAddInvoice();
  const { showToast } = useToast();
  const { data: tasks = [], isLoading: tasksLoading } = useInvoices();

  const [formData, setFormData] = useState({
    clientName: '',
    clientWallet: '',
    projectTitle: '',
    projectDescription: '',
    hoursWorked: '',
    ratePerHour: '',
    useTeamSplit: false,
    useTaskSelection: false,
    billingType: 'service', // 'service', 'restaurant', 'fare', 'custom'
    customAmount: '',
    customDescription: '',
  });

  const [selectedTasks, setSelectedTasks] = useState<bigint[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', walletAddress: '', percentage: 100 }
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [btcToUsd, setBtcToUsd] = useState(110_000); 
  const [generatedAddress] = useState('bc1p0gjmrhfy3gt3j8ykrw2vm7tqnzapq589kgjtg9sk6h48sjm6pv2skzgndm');
  const [invoiceId, setInvoiceId] = useState<bigint>(BigInt(Date.now()));
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Parse task data from backend
  const parsedTasks: Task[] = tasks.map(([id, details]) => {
    try {
      const parsed = JSON.parse(details);
      return {
        id,
        title: parsed.title || 'Untitled Task',
        description: parsed.description || details,
        timeSpent: parsed.timeSpent || { hours: 0, minutes: 0 },
        tags: parsed.tags || [],
        status: parsed.status || 'Pending',
        invoiceId: parsed.invoiceId ? BigInt(parsed.invoiceId) : undefined,
        createdAt: parsed.createdAt || new Date().toISOString(),
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    } catch {
      return {
        id,
        title: 'Legacy Task',
        description: details,
        timeSpent: { hours: 0, minutes: 0 },
        tags: [],
        status: 'Pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  });

  // Calculate totals from selected tasks
  const selectedTasksData = parsedTasks.filter(task => selectedTasks.includes(task.id));
  const totalHoursFromTasks = selectedTasksData.reduce((sum, task) => {
    return sum + task.timeSpent.hours + (task.timeSpent.minutes / 60);
  }, 0);

  const effectiveHours = formData.useTaskSelection ? totalHoursFromTasks : parseFloat(formData.hoursWorked || '0');
  
  // Calculate total based on billing type
  const calculateTotal = () => {
    switch (formData.billingType) {
      case 'service':
        return effectiveHours * parseFloat(formData.ratePerHour || '0');
      case 'restaurant':
      case 'fare':
      case 'custom':
        return parseFloat(formData.customAmount || '0');
      default:
        return 0;
    }
  };
  
  const totalBtc = calculateTotal();
  const totalUsd = totalBtc * btcToUsd;

  const addTeamMember = () => {
    const newId = (teamMembers.length + 1).toString();
    setTeamMembers([...teamMembers, { id: newId, walletAddress: '', percentage: 0 }]);
  };

  const removeTeamMember = (id: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string | number) => {
    setTeamMembers(teamMembers.map(member =>
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const totalPercentage = teamMembers.reduce((sum, member) => sum + member.percentage, 0);

  // Comprehensive Bitcoin address and Lightning invoice validation
  const isValidBitcoinAddress = (address: string): boolean => {
    if (!address || address.trim() === '') return false;

    const trimmedAddress = address.trim();

    // Lightning Network invoice validation (lnbc, lntb, lnbcrt prefixes)
    const lightningRegex = /^lnbc[0-9a-z]*|^lntb[0-9a-z]*|^lnbcrt[0-9a-z]*/i;
    if (lightningRegex.test(trimmedAddress)) {
      // Basic Lightning invoice structure validation
      // Lightning invoices should have minimum length and contain expected characters
      return trimmedAddress.length >= 100 && /^[lnbcrtlntb0-9a-z]+$/i.test(trimmedAddress);
    }

    // Bitcoin address validation: Legacy (P2PKH), P2SH, Bech32, Bech32m
    // Updated to support all Bitcoin address formats including Bech32m (bc1p) and testnet (tb1)
    const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$|^bc1p[a-z0-9]{58,62}$|^tb1[a-z0-9]{39,59}$|^tb1p[a-z0-9]{58,62}$|^bcrt1[a-z0-9]{39,59}$/;
    return btcRegex.test(trimmedAddress);
  };

  const handleFileUploadComplete = (filePath: string) => {
    setUploadedFiles(prev => [...prev, filePath]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.useTeamSplit && totalPercentage !== 100) {
      showToast({
        title: 'Team member percentages must total 100%',
        type: 'error',
      });
      return;
    }

    if (formData.useTaskSelection && selectedTasks.length === 0) {
      showToast({
        title: 'Please select at least one task',
        type: 'error',
      });
      return;
    }

    if (!formData.clientName.trim()) {
      showToast({
        title: 'Please enter a client name',
        type: 'error',
      });
      return;
    }

    if (!formData.projectTitle.trim()) {
      showToast({
        title: 'Please enter a project title',
        type: 'error',
      });
      return;
    }

    // Validate Bitcoin address (Lightning invoices will be handled separately)
    const addressToUse = formData.clientWallet.trim() !== '' ? formData.clientWallet : generatedAddress;
    
    // Check if it's a Lightning invoice
    const isLightningInvoice = addressToUse.startsWith('lnbc') || addressToUse.startsWith('lntb') || addressToUse.startsWith('lnbcrt');
    
    if (!isLightningInvoice && !isValidBitcoinAddress(addressToUse)) {
      showToast({
        title: 'Please enter a proper Bitcoin address',
        type: 'error',
      });
      return;
    }
    
    // For Lightning invoices, don't pass to backend Bitcoin address field
    const bitcoinAddressForBackend = isLightningInvoice ? undefined : addressToUse;

    // Validate based on billing type
    if (formData.billingType === 'service') {
      if (!formData.ratePerHour || parseFloat(formData.ratePerHour) <= 0) {
        showToast({
          title: 'Please enter a valid rate per hour',
          type: 'error',
        });
        return;
      }
    } else {
      if (!formData.customAmount || parseFloat(formData.customAmount) <= 0) {
        showToast({
          title: 'Please enter a valid amount',
          type: 'error',
        });
        return;
      }
    }

    const details = `Client: ${formData.clientName}, Amount: ${Math.round(totalBtc * 100000)}, Status: pending, Project: ${formData.projectTitle}, Type: ${formData.billingType}${formData.billingType === 'service' ? `, Hours: ${effectiveHours}, Rate: ${formData.ratePerHour}` : `, Description: ${formData.customDescription}`}`;

    try {
      await addInvoiceMutation.mutateAsync({
        id: invoiceId,
        details: details,
        address: bitcoinAddressForBackend
      });

      
      const successMessage = `Invoice #${invoiceId} created successfully!`;
      showToast({
        title: successMessage,
        type: 'success',
      });
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const generateQRCode = () => {
    return qrCode;
  };

  const copyLink = () => {
    showToast({
      title: 'Link copied to clipboard',
      type: 'success',
    });
    navigator.clipboard.writeText(baseLink + invoiceId);
  };

  const formatTime = (timeSpent: { hours: number; minutes: number }) => {
    const { hours, minutes } = timeSpent;
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  if (showPreview) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Preview</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-gray-600 mt-2">Bitcoin Payment Invoice</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Invoice Date</p>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
              <p className="text-gray-700">{formData.clientName}</p>
              {formData.clientWallet && (
                <p className="text-sm text-gray-600 break-all">{formData.clientWallet}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Project:</h3>
              <p className="text-gray-700">{formData.projectTitle}</p>
              <p className="text-sm text-gray-600">{formData.projectDescription}</p>
            </div>
          </div>

          {/* Billing Type Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">
                {formData.billingType === 'service' ? '💼' : 
                 formData.billingType === 'restaurant' ? '🍽️' : 
                 formData.billingType === 'fare' ? '🚗' : '📝'}
              </span>
              <h3 className="font-semibold text-blue-900">
                {formData.billingType === 'service' ? 'Service Invoice' : 
                 formData.billingType === 'restaurant' ? 'Restaurant Bill' : 
                 formData.billingType === 'fare' ? 'Transport Fare' : 'Custom Payment'}
              </h3>
            </div>
            {formData.billingType !== 'service' && formData.customDescription && (
              <p className="text-sm text-blue-800">{formData.customDescription}</p>
            )}
          </div>

          {formData.useTaskSelection && selectedTasksData.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Work Performed:</h3>
              <div className="space-y-2">
                {selectedTasksData.map((task) => (
                  <div key={task.id.toString()} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatTime(task.timeSpent)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-2">
                  {formData.billingType === 'service' ? '💼' : 
                   formData.billingType === 'restaurant' ? '🍽️' : 
                   formData.billingType === 'fare' ? '🚗' : '📝'}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formData.billingType === 'service' ? 'Service Billing' : 
                   formData.billingType === 'restaurant' ? 'Restaurant Bill' : 
                   formData.billingType === 'fare' ? 'Transport Fare' : 'Custom Payment'}
                </h3>
              </div>
            </div>
            
            {formData.billingType === 'service' ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Hours Worked</p>
                  <p className="text-xl font-semibold">{effectiveHours.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rate per Hour</p>
                  <p className="text-xl font-semibold">{formData.ratePerHour} BTC</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-semibold text-orange-600">{totalBtc.toFixed(8)} BTC</p>
                  <p className="text-sm text-gray-600">${totalUsd.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">
                    {formData.billingType === 'restaurant' ? 'Bill Amount' : 
                     formData.billingType === 'fare' ? 'Fare Amount' : 'Amount'}
                  </p>
                  <p className="text-xl font-semibold text-orange-600">{totalBtc.toFixed(8)} BTC</p>
                  <p className="text-sm text-gray-600">${totalUsd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.customDescription || 'No description provided'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {formData.useTeamSplit && teamMembers.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Split:</h3>
              <div className="space-y-2">
                {teamMembers.map((member, index) => (
                  <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600 break-all">{member.walletAddress || `Team Member ${index + 1}`}</span>
                    <span className="font-semibold">{member.percentage}% ({(totalBtc * member.percentage / 100).toFixed(8)} BTC)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Attached Files:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center">
                        <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">{file}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Uploaded</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Address:</h3>
                <div className="bg-gray-100 p-3 rounded break-all text-sm font-mono">
                  {generatedAddress}
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-3">QR Code:</h3>
                <img
                  src={generateQRCode()}
                  alt="Bitcoin Payment QR Code"
                  className="mx-auto border rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Wallet Address / Lightning Invoice</label>
              <input
                type="text"
                value={formData.clientWallet}
                onChange={(e) => setFormData({ ...formData, clientWallet: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any Bitcoin address or Lightning invoice"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepts Bitcoin addresses (Legacy, P2SH, Bech32, Bech32m) or Lightning invoices (lnbc, lntb, lnbcrt)<br/>
                Leave empty to use the default generated address: {generatedAddress.substring(0, 20)}...
              </p>
            </div>
          </div>
        </div>

        {/* Project Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter project description"
              />
            </div>
          </div>
        </div>

        {/* Billing Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'service', label: 'Service', icon: '💼' },
              { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
              { value: 'fare', label: 'Transport', icon: '🚗' },
              { value: 'custom', label: 'Custom', icon: '📝' }
            ].map((type) => (
              <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="billingType"
                  value={type.value}
                  checked={formData.billingType === type.value}
                  onChange={(e) => setFormData({ ...formData, billingType: e.target.value as any })}
                  className="text-blue-600"
                />
                <span className="text-xl">{type.icon}</span>
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Service Billing */}
        {formData.billingType === 'service' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Billing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours Worked</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hoursWorked}
                  onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hours worked"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate per Hour (BTC)</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.ratePerHour}
                  onChange={(e) => setFormData({ ...formData, ratePerHour: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rate per hour"
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom Billing */}
        {formData.billingType !== 'service' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (BTC)</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.customAmount}
                  onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount in BTC"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.customDescription}
                  onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter payment description"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <QrCode className="h-5 w-5 mr-2" />
            Preview Invoice
          </button>

          <button
            type="submit"
            disabled={addInvoiceMutation.isPending || (formData.useTeamSplit && totalPercentage !== 100) || (formData.useTaskSelection && selectedTasks.length === 0)}
            className="flex items-center md:w-1/4 w-1/2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {addInvoiceMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreation;
