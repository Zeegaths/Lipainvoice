import { useEffect, useState } from 'react';
import { Search, ChevronDown, Calendar, Download, Filter } from 'lucide-react';
import useInvoices from '../hooks/useInvoices';
import LoadingSpinner from '../components/LoadingSpinner';


interface Invoice {
  id: number;
  taskId: number | null;
  client: string;
  amount: number;
  status: string;
  date: string;
}

type Tab = "all" | "pending" | "paid"

const Dashboard = () => {
  const { invoices, isLoading, error } = useInvoices();
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(invoices || [])
  const [loading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("all")

  useEffect(() => {
    const checkInvoices = async () => {
      setIsLoading(true)
      if (invoices) {
        setIsLoading(false)
      }
    }
    checkInvoices()
  }, [invoices])



  if (!invoices || isLoading || loading) {
    return (
      <div className='flex items-center justify-center h-screen w-screen'>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    <div>
      <p className='text-red-500'>
        {error.message}
      </p>
    </div>
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
      setFilteredInvoices(invoices)
      return;
    }
    const filtered = invoices.filter((invoice) => invoice.status.toLowerCase() === status)
    setFilteredInvoices(filtered || [])

  }

  const totalInvoices = invoices.length;
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalUnpaid = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">${(totalInvoices * 632).toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-500 text-sm">↗</span>
                    <span className="text-green-600 text-sm font-medium ml-1">+17%/month</span>
                  </div>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-lg lg:text-xl font-bold">$</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">${(totalPaid * 100000).toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-purple-500 text-sm">↗</span>
                    <span className="text-purple-600 text-sm font-medium ml-1">+32%/month</span>
                  </div>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-lg lg:text-xl font-bold">$</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Unpaid</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">${(totalUnpaid * 100000).toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-red-500 text-sm">↘</span>
                    <span className="text-red-600 text-sm font-medium ml-1">-17%/month</span>
                  </div>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-lg lg:text-xl font-bold">$</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate">${(totalOverdue * 100000).toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-500 text-sm">↗</span>
                    <span className="text-green-600 text-sm font-medium ml-1">+17%/month</span>
                  </div>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-lg lg:text-xl font-bold">$</span>
                </div>
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
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">4</span>
            </button>
            <button
              onClick={() => filterByStatus("paid")}
              className={`${activeTab === "paid" ? 'text-green-600 border-b-2 border-green-600' : null} text-sm font-medium pb-2 whitespace-nowrap`}
            >
              Paid
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">7</span>
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
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <span>+ New Invoice</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </th>
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
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        INV-{String(invoice.id).padStart(4, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.client}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">@{invoice.client.toLowerCase().replace(/\s+/g, '')}@gmail.com</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${(invoice.amount * 100000).toFixed(0)}</td>
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
