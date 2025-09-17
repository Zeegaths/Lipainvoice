import { useState } from 'react';
import { Bitcoin, DollarSign, Users, Download, QrCode, ArrowLeft, Plus, Trash2, CheckSquare, Paperclip, Loader2, Zap } from 'lucide-react';
import { useAddInvoice, useInvoices } from '../hooks/useQueries';
import FileUpload from '../components/FileUpload';
import { useToast } from '../components/ToastContainer';
import { useLightningNetwork } from '../services/LightningService';
import { Page } from '../App';

interface InvoiceCreationProps {
  onNavigate: (page: Page) => void;
}

interface TeamMember {
  id: string;
  walletAddress: string;
  percentage: number;
}

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

  // Lightning Network integration
  const { 
    isLoading: lightningLoading, 
    isAuthenticated: lightningAuthenticated, 
    wallet, 
    generateWallet, 
    createInvoice: createLightningInvoice,
    error: lightningError 
  } = useLightningNetwork();

  const [formData, setFormData] = useState({
    clientName: '',
    clientWallet: '',
    projectTitle: '',
    projectDescription: '',
    hoursWorked: '',
    ratePerHour: '',
    useTeamSplit: false,
    useTaskSelection: false,
    paymentMethod: 'bitcoin' as 'bitcoin' | 'lightning', // NEW: Payment method selection
  });

  const [selectedTasks, setSelectedTasks] = useState<bigint[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', walletAddress: '', percentage: 100 }
  ]);

  const [showPreview, setShowPreview] = useState(false);
  const [btcToUsd, setBtcToUsd] = useState(110_000); 
  const [generatedAddress] = useState('bc1p0gjmrhfy3gt3j8ykrw2vm7tqnzapq589kgjtg9sk6h48sjm6pv2skzgndm');
  const [createdInvoiceId, setCreatedInvoiceId] = useState<bigint | null>(null);
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
  const totalBtc = effectiveHours * parseFloat(formData.ratePerHour || '0');
  const totalUsd = totalBtc * btcToUsd;
  const totalSats = Math.round(totalBtc * 100000000); // Convert BTC to sats

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

  const handleTaskSelection = (taskId: bigint) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleFileUploadComplete = (filePath: string) => {
    setUploadedFiles(prev => [...prev, filePath]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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

    if (!formData.ratePerHour || parseFloat(formData.ratePerHour) <= 0) {
      showToast({
        title: 'Please enter a valid rate per hour',
        type: 'error',
      });
      return;
    }

    // Handle Lightning Network payment
    if (formData.paymentMethod === 'lightning') {
      try {
        console.log('Starting Lightning payment setup...');
        
        if (!lightningAuthenticated) {
          showToast({ title: 'Please authenticate with Internet Identity first', type: 'error' });
          return;
        }

        // Ensure user has Lightning wallet
        if (!wallet) {
          console.log('No wallet found, generating...');
          showToast({ title: 'Creating Lightning wallet...', type: 'info' });

          const walletResult = await generateWallet();
          console.log('Wallet generation result:', walletResult);
          
          if (!walletResult.success) {
            showToast({
              title: `Failed to create Lightning wallet: ${walletResult.error}`,
              type: 'error',
            });
            return;
          }
        }

        // Create Lightning invoice
        const description = `${formData.projectTitle} - ${formData.clientName} (${effectiveHours}h)`;
        
        console.log('Creating Lightning invoice with:', { amountSats: totalSats, description });
        
        const lightningResult = await createLightningInvoice(totalSats, description);
        console.log('Lightning invoice result:', lightningResult);

        if (lightningResult.success && lightningResult.invoice) {
          // Store Lightning invoice data for the payment page
          const invoiceData = {
            invoiceNumber: `INV-${Date.now()}`,
            freelancer: {
              name: "Your Name", // You can customize this
              title: "Developer",
              email: "your-email@domain.com",
              avatar: "YN",
            },
            amount: {
              usd: totalUsd,
              btc: totalBtc,
              sats: totalSats,
            },
            items: formData.useTaskSelection 
              ? selectedTasksData.map(task => ({
                  description: `${task.title} (${task.timeSpent.hours}h ${task.timeSpent.minutes}m)`,
                  amount: (task.timeSpent.hours + task.timeSpent.minutes / 60) * parseFloat(formData.ratePerHour) * btcToUsd
                }))
              : [{
                  description: `${formData.projectTitle} (${effectiveHours} hours)`,
                  amount: totalUsd
                }],
            clientName: formData.clientName,
            projectTitle: formData.projectTitle,
            projectDescription: formData.projectDescription,
            paymentMethod: 'lightning',
            lightningInvoice: {
              id: lightningResult.invoice.id,
              payment_request: lightningResult.invoice.payment_request,
              payment_hash: lightningResult.invoice.payment_hash,
              amount_msat: Number(lightningResult.invoice.amount_msat),
              description: lightningResult.invoice.description,
              expires_at: Number(lightningResult.invoice.expires_at),
              status: lightningResult.invoice.status,
              created_at: Number(lightningResult.invoice.created_at),
            },
            teamMembers: formData.useTeamSplit ? teamMembers : [],
            selectedTasks: formData.useTaskSelection ? selectedTasksData : [],
            uploadedFiles,
          };

          // Store in session storage for the Lightning payment page
          sessionStorage.setItem('invoiceData', JSON.stringify(invoiceData));
          sessionStorage.setItem('lightningInvoice', JSON.stringify(invoiceData.lightningInvoice));
          
          showToast({
            title: 'Lightning invoice created successfully!',
            type: 'success',
          });
          
          // Navigate to Lightning payment page
          onNavigate('lightning-payment');
          return;
        } else {
          showToast({
            title: `Lightning invoice creation failed: ${lightningResult.error}`,
            type: 'error',
          });
          return;
        }
      } catch (error) {
        console.error('Lightning payment error:', error);
        showToast({ title: `Lightning payment setup failed: ${error.message}`, type: 'error' });
        return;
      }
    }

    // Handle traditional Bitcoin payment (EXACTLY as before)
    const details = `Client: ${formData.clientName}, Amount: ${Math.round(totalBtc * 100000)}, Status: pending, Project: ${formData.projectTitle}, Hours: ${effectiveHours}, Rate: ${formData.ratePerHour}`;

    try {
      const invoiceId = BigInt(Date.now());
      
      // Store Bitcoin invoice data for payment page
      const invoiceData = {
        invoiceNumber: `INV-${invoiceId}`,
        freelancer: {
          name: "Your Name",
          title: "Developer", 
          email: "your-email@domain.com",
          avatar: "YN",
        },
        amount: {
          usd: totalUsd,
          btc: totalBtc,
          sats: totalSats,
        },
        items: formData.useTaskSelection 
          ? selectedTasksData.map(task => ({
              description: `${task.title} (${task.timeSpent.hours}h ${task.timeSpent.minutes}m)`,
              amount: (task.timeSpent.hours + task.timeSpent.minutes / 60) * parseFloat(formData.ratePerHour) * btcToUsd
            }))
          : [{
              description: `${formData.projectTitle} (${effectiveHours} hours)`,
              amount: totalUsd
            }],
        clientName: formData.clientName,
        projectTitle: formData.projectTitle,
        projectDescription: formData.projectDescription,
        paymentMethod: 'bitcoin',
        btcAddress: generatedAddress,
        teamMembers: formData.useTeamSplit ? teamMembers : [],
        selectedTasks: formData.useTaskSelection ? selectedTasksData : [],
        uploadedFiles,
      };

      sessionStorage.setItem('invoiceData', JSON.stringify(invoiceData));

      await addInvoiceMutation.mutateAsync({
        id: invoiceId,
        details: details,
        address: formData.clientWallet
      });

      setCreatedInvoiceId(invoiceId);
      
      const successMessage = `Invoice #${invoiceId} created successfully!`;
      showToast({
        title: successMessage,
        type: 'success',
      });
      
      // Navigate to Bitcoin payment page
      onNavigate('bitcoin-payment');
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:${generatedAddress}?amount=${totalBtc}`;
  };

  const downloadPDF = () => {
    alert('PDF download functionality would be implemented here');
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
                <p className="text-gray-600 mt-2 flex items-center">
                  {formData.paymentMethod === 'lightning' ? (
                    <>
                      <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                      Lightning Network Payment
                    </>
                  ) : (
                    <>
                      <Bitcoin className="h-4 w-4 mr-1 text-orange-500" />
                      Bitcoin Payment Invoice
                    </>
                  )}
                </p>
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
                <p className="text-sm text-gray-600">≈ ${totalUsd.toLocaleString()} USD</p>
                {formData.paymentMethod === 'lightning' && (
                  <p className="text-xs text-yellow-600">{totalSats.toLocaleString()} sats</p>
                )}
              </div>
            </div>
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
                <div className="flex items-center text-gray-600">
                  <Paperclip className="h-4 w-4 mr-2" />
                  <span>{uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} attached</span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {formData.paymentMethod === 'lightning' ? 'Lightning Invoice' : 'Payment Address'}:
                </h3>
                <div className="bg-gray-100 p-3 rounded break-all text-sm font-mono">
                  {formData.paymentMethod === 'lightning' 
                    ? 'Lightning invoice will be generated after creation'
                    : generatedAddress
                  }
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-3">QR Code:</h3>
                {formData.paymentMethod === 'lightning' ? (
                  <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center mx-auto">
                    <div className="text-center text-gray-500">
                      <Zap className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Lightning QR will be generated</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={generateQRCode()}
                    alt="Bitcoin Payment QR Code"
                    className="mx-auto border rounded"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={downloadPDF}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </button>
          <button
            onClick={handleSubmit}
            disabled={addInvoiceMutation.isPending || lightningLoading}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {addInvoiceMutation.isPending || lightningLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {formData.paymentMethod === 'lightning' ? <Zap className="h-5 w-5 mr-2" /> : <Bitcoin className="h-5 w-5 mr-2" />}
                Create {formData.paymentMethod === 'lightning' ? 'Lightning' : 'Bitcoin'} Invoice
              </>
            )}
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
        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600">Generate a professional invoice for Bitcoin or Lightning payments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection - NEW SECTION */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 ml-3">Payment Method</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.paymentMethod === 'bitcoin' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="bitcoin"
                checked={formData.paymentMethod === 'bitcoin'}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'bitcoin' | 'lightning' })}
                className="sr-only"
              />
              <div className="flex items-center">
                <Bitcoin className="h-6 w-6 text-orange-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Bitcoin (On-chain)</div>
                  <div className="text-sm text-gray-500">Traditional Bitcoin payment</div>
                </div>
              </div>
            </label>
            
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.paymentMethod === 'lightning' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="lightning"
                checked={formData.paymentMethod === 'lightning'}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'bitcoin' | 'lightning' })}
                className="sr-only"
              />
              <div className="flex items-center">
                <Zap className="h-6 w-6 text-yellow-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Lightning Network</div>
                  <div className="text-sm text-gray-500">Instant, low-fee payments</div>
                </div>
              </div>
            </label>
          </div>

          {/* Lightning Status Indicator */}
          {formData.paymentMethod === 'lightning' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              {lightningLoading ? (
                <div className="flex items-center text-yellow-700">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Initializing Lightning Network...
                </div>
              ) : !lightningAuthenticated ? (
                <div className="text-yellow-700">
                  <p className="font-medium">Internet Identity Required</p>
                  <p className="text-sm">You need to be authenticated to use Lightning Network payments.</p>
                </div>
              ) : !wallet ? (
                <div className="text-yellow-700">
                  <p className="font-medium">Lightning Wallet Setup</p>
                  <p className="text-sm">A Lightning wallet will be created automatically when you create the invoice.</p>
                </div>
              ) : (
                <div className="text-green-700">
                  <p className="font-medium">Lightning Ready</p>
                  <p className="text-sm">Your Lightning wallet is ready. Balance: {Number(wallet.balance_sats)} sats</p>
                </div>
              )}
              
              {lightningError && (
                <div className="text-red-700 mt-2">
                  <p className="font-medium">Error:</p>
                  <p className="text-sm">{lightningError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                className="input-field"
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client {formData.paymentMethod === 'lightning' ? 'Lightning/Bitcoin Wallet (Optional)' : 'Bitcoin Wallet'}
              </label>
              <input
                type="text"
                value={formData.clientWallet}
                onChange={(e) => setFormData({ ...formData, clientWallet: e.target.value })}
                className="input-field"
                placeholder={formData.paymentMethod === 'lightning' ? 'Lightning address or Bitcoin wallet' : 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'}
                required={formData.paymentMethod === 'bitcoin'}
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              {formData.paymentMethod === 'lightning' ? (
                <Zap className="h-5 w-5 text-green-600" />
              ) : (
                <Bitcoin className="h-5 w-5 text-green-600" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 ml-3">Project Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                className="input-field"
                placeholder="Enter project title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description
              </label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Describe the project work"
                required
              />
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckSquare className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 ml-3">Work Details</h2>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.useTaskSelection}
                onChange={(e) => setFormData({ ...formData, useTaskSelection: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Select from logged tasks</span>
            </label>
          </div>

          {formData.useTaskSelection ? (
            <div className="space-y-4">
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {tasksLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>Loading tasks...</p>
                  </div>
                ) : parsedTasks.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No tasks available</p>
                    <button
                      type="button"
                      onClick={() => onNavigate('dashboard')}
                      className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                    >
                      Go to Task Logger to create tasks
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {parsedTasks.map((task) => (
                      <label key={task.id.toString()} className="flex items-center p-3 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => handleTaskSelection(task.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <span className="text-sm text-gray-600">{formatTime(task.timeSpent)}</span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600">{task.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {selectedTasksData.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-900 mb-2">Selected Tasks Summary:</p>
                  <p className="text-sm text-purple-700">
                    {selectedTasksData.length} tasks selected • Total time: {totalHoursFromTasks.toFixed(2)} hours
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Worked
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hoursWorked}
                  onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                  className="input-field"
                  placeholder="0.0"
                  required={!formData.useTaskSelection}
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate per Hour (BTC)
            </label>
            <input
              type="number"
              step="0.00000001"
              value={formData.ratePerHour}
              onChange={(e) => setFormData({ ...formData, ratePerHour: e.target.value })}
              className="input-field"
              placeholder="0.00000000"
              required
            />
          </div>

          {/* Total Calculation */}
          {totalBtc > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">{totalBtc.toFixed(8)} BTC</p>
                  <p className="text-sm text-gray-600">≈ ${totalUsd.toLocaleString()} USD</p>
                  {formData.paymentMethod === 'lightning' && (
                    <p className="text-xs text-yellow-600">{totalSats.toLocaleString()} sats</p>
                  )}
                  <p className="text-xs text-gray-500">{effectiveHours.toFixed(2)} hours</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team Payment Split */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 ml-3">Team Payment Split</h2>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.useTeamSplit}
                onChange={(e) => setFormData({ ...formData, useTeamSplit: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable team split</span>
            </label>
          </div>

          {formData.useTeamSplit && (
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={member.walletAddress}
                      onChange={(e) => updateTeamMember(member.id, 'walletAddress', e.target.value)}
                      className="input-field"
                      placeholder={formData.paymentMethod === 'lightning' ? 'Lightning/Bitcoin wallet address' : 'Bitcoin wallet address'}
                      required={formData.useTeamSplit}
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={member.percentage}
                      onChange={(e) => updateTeamMember(member.id, 'percentage', parseFloat(e.target.value) || 0)}
                      className="input-field text-center"
                      placeholder="0"
                      required={formData.useTeamSplit}
                    />
                  </div>
                  <span className="text-sm text-gray-600">%</span>
                  {teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="flex items-center px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </button>
                <div className={`text-sm font-medium ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  Total: {totalPercentage}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Paperclip className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 ml-3">Supporting Documents</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Upload supporting documents for this invoice. Files will be attached after the invoice is created.
          </p>

          {createdInvoiceId ? (
            <FileUpload
              invoiceId={createdInvoiceId}
              onUploadComplete={handleFileUploadComplete}
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">File upload will be available after creating the invoice</p>
              <p className="text-sm text-gray-500 mt-2">
                Create the invoice first, then you can upload supporting documents
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
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
            disabled={
              addInvoiceMutation.isPending || 
              (formData.useTeamSplit && totalPercentage !== 100) || 
              (formData.useTaskSelection && selectedTasks.length === 0) ||
              (formData.paymentMethod === 'lightning' && lightningLoading)
            }
            className="flex items-center md:w-1/4 w-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {addInvoiceMutation.isPending || lightningLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {formData.paymentMethod === 'lightning' ? <Zap className="h-5 w-5 mr-2" /> : <Bitcoin className="h-5 w-5 mr-2" />}
                Create {formData.paymentMethod === 'lightning' ? 'Lightning' : 'Bitcoin'} Invoice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreation;