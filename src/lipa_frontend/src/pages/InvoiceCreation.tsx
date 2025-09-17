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
        address: formData.clientWallet
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
    alert('Link copied to clipboard');
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

        <div className="flex space-x-4">
          <button
            onClick={copyLink}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <CopyPlus className="h-5 w-5 mr-2" />
            Copy Link
          </button>
          <button
            onClick={handleSubmit}
            disabled={addInvoiceMutation.isPending}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {addInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
          </button>
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
        <h1 className="text-2xl font-bold text-gray-900">Create Bitcoin Invoice</h1>
        <p className="text-gray-600">Generate a professional invoice for Bitcoin payments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-gray-300 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 ml-3">Client Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="input-field rounded-3xl"
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Bitcoin Wallet (Optional)
              </label>
              <input
                type="text"
                value={formData.clientWallet}
                onChange={(e) => setFormData({ ...formData, clientWallet: e.target.value })}
                className="input-field rounded-3xl"
                placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-300 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bitcoin className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 ml-3">Payment Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Title
              </label>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                className="input-field rounded-3xl"
                placeholder="Enter payment title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Description
              </label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                className="input-field rounded-3xl"
                rows={3}
                placeholder="What work/service is being provided?"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckSquare className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 ml-3">Billing Details</h2>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'service', label: 'Service/Work', icon: '💼' },
                { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
                { value: 'fare', label: 'Transport', icon: '🚗' },
                { value: 'custom', label: 'Custom', icon: '📝' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, billingType: type.value as any })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.billingType === type.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Billing Fields */}
          {formData.billingType === 'service' && (
            <>
              <div className="max-w-md mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Worked
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hoursWorked}
                  onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                  className="input-field rounded-3xl"
                  placeholder="0.0"
                  required={!formData.useTaskSelection}
                />
              </div>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate per Hour (BTC)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.ratePerHour}
                  onChange={(e) => setFormData({ ...formData, ratePerHour: e.target.value })}
                  className="input-field rounded-3xl"
                  placeholder="0.00000000"
                  required
                />
              </div>
            </>
          )}

          {(formData.billingType === 'restaurant' || formData.billingType === 'fare' || formData.billingType === 'custom') && (
            <>
              <div className="max-w-md mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.billingType === 'restaurant' ? 'Bill Amount (BTC)' : 
                   formData.billingType === 'fare' ? 'Fare Amount (BTC)' : 
                   'Amount (BTC)'}
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.customAmount}
                  onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                  className="input-field rounded-3xl"
                  placeholder="0.00000000"
                  required
                />
              </div>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.billingType === 'restaurant' ? 'Restaurant/Order Details' : 
                   formData.billingType === 'fare' ? 'Trip Details' : 
                   'Description'}
                </label>
                <input
                  type="text"
                  value={formData.customDescription}
                  onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
                  className="input-field rounded-3xl"
                  placeholder={formData.billingType === 'restaurant' ? 'e.g., Dinner for 4 people' : 
                             formData.billingType === 'fare' ? 'e.g., Airport to Downtown' : 
                             'Enter description'}
                />
              </div>
            </>
          )}

          {totalBtc > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">{totalBtc.toFixed(8)} BTC</p>
                  <p className="text-sm text-gray-600">≈ ${totalUsd.toLocaleString()} USD</p>
                  {formData.billingType === 'service' && (
                    <p className="text-xs text-gray-500">{effectiveHours.toFixed(2)} hours</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-300 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Paperclip className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 ml-3">Supporting Documents</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Upload supporting documents for this invoice. Files will be attached after the invoice is created.
          </p>

          <FileUpload
            invoiceId={invoiceId}
            onUploadComplete={handleFileUploadComplete}
          />
        </div>

        <div className="flex space-x-4 md:justify-end justify-between">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <QrCode className="h-5 w-5 mr-2" />
            Preview
          </button>
          <button
            type="submit"
            disabled={addInvoiceMutation.isPending || (formData.useTeamSplit && totalPercentage !== 100) || (formData.useTaskSelection && selectedTasks.length === 0)}
            className="flex items-center md:w-1/4 w-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {addInvoiceMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreation;
