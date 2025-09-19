import { useEffect, useState } from 'react';
import { Search, Plus, Wallet, Clock, Calendar, BadgeDollarSign } from 'lucide-react';
import { useInvoices } from '../hooks/useQueries';
import LoadingSpinner from '../components/LoadingSpinner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Page } from '../App';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

interface BackendInvoice {
  id: bigint;
  details: string;
  files: Array<{
    name: string;
    mimeType: string;
    size: bigint;
    uploadedAt: bigint;
    path: string;
  }>;
  bitcoinAddress?: string;
}

interface Invoice {
  id: number;
  taskId: number | null;
  client: string;
  amount: number;
  status: string;
  date: string;
}

type Tab = "all" | "pending" | "paid"

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { data: backendInvoices, isLoading, error } = useInvoices();
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const { isAuthenticated } = useInternetIdentity();

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('landing');
    }
  }, [isAuthenticated, onNavigate]);

  const transformInvoices = (backendInvoices: Array<[bigint, BackendInvoice]>): Invoice[] => {
    return backendInvoices.map(([id, invoice]) => {
      const details = invoice.details;
      const clientMatch = details.match(/Client:\s*([^,]+)/);
      const amountMatch = details.match(/Amount:\s*(\d+)/);
      const statusMatch = details.match(/Status:\s*(\w+)/);
      
      return {
        id: Number(id),
        taskId: null,
        client: clientMatch ? clientMatch[1].trim() : 'Unknown Client',
        amount: amountMatch ? parseInt(amountMatch[1]) : 0,
        status: statusMatch ? statusMatch[1].toLowerCase() : 'pending',
        date: new Date().toLocaleDateString(),
      };
    });
  };

  useEffect(() => {
    if (backendInvoices) {
      const transformed = transformInvoices(backendInvoices);
      setFilteredInvoices(transformed);
    }
  }, [backendInvoices]);



  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen w-screen'>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen w-screen'>
        <div className='text-center'>
          <p className='text-red-500 text-lg mb-4'>
            Error loading invoices
          </p>
          <p className='text-gray-600'>
            {error.message}
          </p>
        </div>
      </div>
    )
  }

  const filterByStatus = (status: string) => {
    if (!status) {
      throw new Error("Invalid status to filter")
    }
    switch (status) {
      case "all":
        setActiveTab("all")
        break;
      case "pending":
        setActiveTab("pending")
        break;
      case "paid":
        setActiveTab("paid")
        break;
      default:
        setActiveTab("all")
    }

    if (status === "all") {
      const transformed = backendInvoices ? transformInvoices(backendInvoices) : [];
      setFilteredInvoices(transformed)
      return;
    }
    const transformed = backendInvoices ? transformInvoices(backendInvoices) : [];
    const filtered = transformed.filter((invoice: Invoice) => invoice.status.toLowerCase() === status)
    setFilteredInvoices(filtered || [])

  }

  const transformedInvoices = backendInvoices ? transformInvoices(backendInvoices) : [];
  const totalInvoices = transformedInvoices.length;
  const totalPaid = transformedInvoices.filter((inv: Invoice) => inv.status === 'paid').reduce((sum: number, inv: Invoice) => sum + inv.amount, 0);
  const totalUnpaid = transformedInvoices.filter((inv: Invoice) => inv.status === 'unpaid' || inv.status === 'pending').reduce((sum: number, inv: Invoice) => sum + inv.amount, 0);
  const totalOverdue = transformedInvoices.filter((inv: Invoice) => inv.status === 'overdue').reduce((sum: number, inv: Invoice) => sum + inv.amount, 0);
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
        <div className='mb-4 mt-2'>
        <h1 className="text-lg">Amount Earned: </h1>
        <h1 className="text-4xl font-mono font-bold my-2">$0</h1>
        <p className='text-sm text-gray-400'>Amount earned in BTC since May 2025</p>
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <div className="bg-white rounded-3xl border border-gray-300 flex items-center gap-4 px-4 py-2"> 
              <Wallet className="h-16 w-16 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-body">Total Invoices</p>
                <p className="text-4xl font-mono lg:text-2xl font-bold text-gray-900">{(totalInvoices).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-300 flex items-center gap-4 px-4 py-2"> 
              <Clock className="h-16 w-16 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-body">Total Pending</p>
                <p className="text-4xl font-mono lg:text-2xl font-bold text-gray-900">${(totalUnpaid).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-300 flex items-center gap-4 px-4 py-2"> 
              <BadgeDollarSign className="h-16 w-16 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-body">Total Paid</p>
                <p className="text-4xl font-mono lg:text-2xl font-bold text-gray-900">{(totalPaid).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-300 flex items-center gap-4 px-4 py-2"> 
              <Calendar className="h-16 w-16 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600 font-body">Total Overdue</p>
                <p className="text-4xl font-mono lg:text-2xl font-bold text-gray-900">{(totalOverdue).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Invoices</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-6">
            <button
              onClick={() => filterByStatus("all")}
              className={`${activeTab === "all" ? 'text-green-600 border-b-2 border-green-600' : null} text-sm font-medium pb-2 whitespace-nowrap`}
            >
              All Invoices
            </button>
            <button
              onClick={() => filterByStatus("pending")}
              className={`${activeTab === "pending" ? 'text-green-600 border-b-2 border-green-600' : null} text-sm font-medium pb-2 whitespace-nowrap`}
            >
              Unpaid
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                {transformedInvoices.filter((inv: Invoice) => inv.status === 'unpaid' || inv.status === 'pending').length}
              </span>
            </button>
            <button
              onClick={() => filterByStatus("paid")}
              className={`${activeTab === "paid" ? 'text-green-600 border-b-2 border-green-600' : null} text-sm font-medium pb-2 whitespace-nowrap`}
            >
              Paid
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {transformedInvoices.filter((inv: Invoice) => inv.status === 'paid').length}
              </span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex-1 max-w-md mb-4 sm:mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button 
              onClick={() => onNavigate('create-invoice')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices && filteredInvoices.slice(0, 7).map((invoice, index) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        INV-{String(invoice.id).slice(-4)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.client}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">@{invoice.client.toLowerCase().replace(/\s+/g, '')}@gmail.com</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${(invoice.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            invoice.status === 'unpaid' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-gray-400 hover:text-gray-600">•••</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
