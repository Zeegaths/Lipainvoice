// InvoiceSection.js - Updated with more dummy data and label changes
import { useState } from 'react';

interface Invoice {
  id: number;
  taskId: number | null;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'unpaid' | 'overdue';
  date: string;
}

interface InvoiceSectionProps {
  invoices: Invoice[];
  createDirectInvoice: (invoiceData: { client: string; amount: number }) => void;
}

const InvoiceSection = ({ invoices: propInvoices = [], createDirectInvoice }: InvoiceSectionProps) => {
  // Add more dummy data for demonstration
  const dummyInvoices: Invoice[] = [
    { id: 101, taskId: 2, client: 'TechStart', amount: 0.005, status: 'paid', date: '2025-07-25' },
    { id: 102, taskId: 3, client: 'FitLife', amount: 0.008, status: 'pending', date: '2025-07-22' },
    { id: 103, taskId: 6, client: 'Travel Agency', amount: 0.003, status: 'paid', date: '2025-07-29' },
    { id: 104, taskId: null, client: 'Creative Studio', amount: 0.0115, status: 'pending', date: '2025-07-20' },
    { id: 105, taskId: null, client: 'Local Restaurant', amount: 0.0028, status: 'paid', date: '2025-07-15' },
    { id: 106, taskId: 8, client: 'Handmade Crafts', amount: 0.0042, status: 'pending', date: '2025-08-01' },
    { id: 107, taskId: null, client: 'Tech Conference', amount: 0.0135, status: 'pending', date: '2025-07-18' }
  ];
  
  // Use either passed invoices or dummy data if none provided
  const invoices = propInvoices.length > 0 ? propInvoices : dummyInvoices;
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState<{
    client: string;
    amount: number;
  }>({
    client: '',
    amount: 0
  });
  
  // Filter invoices based on status
  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(invoice => invoice.status === filter);
  
  // Calculate totals
  const totalPaid = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
    
  const totalPending = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const totalUnpaid = invoices
    .filter(invoice => invoice.status === 'unpaid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const totalOverdue = invoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      setNewInvoice({
        ...newInvoice,
        amount: value === '' ? 0 : Number(value)
      });
    } else {
      setNewInvoice({
        ...newInvoice,
        [name]: value
      });
    }
  };
  
  // Create a new direct invoice
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDirectInvoice(newInvoice);
    setNewInvoice({ client: '', amount: 0 });
    setShowAddForm(false);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">Invoice Overview</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Invoices</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            {showAddForm ? 'Cancel' : 'Create Invoice'}
          </button>
        </div>
      </div>
      
      {/* Direct invoice creation form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <input
                type="text"
                name="client"
                value={newInvoice.client}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (BTC)</label>
              <input
                type="number"
                name="amount"
                value={newInvoice.amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                step="0.0001"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </form>
      )}
      
      {/* Invoice stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-700">Paid</h3>
          <p className="text-lg font-bold text-green-600">{totalPaid.toFixed(4)} BTC</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-700">Pending</h3>
          <p className="text-lg font-bold text-yellow-600">{totalPending.toFixed(4)} BTC</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <h3 className="text-sm font-medium text-purple-700">Unpaid</h3>
          <p className="text-lg font-bold text-purple-600">{totalUnpaid.toFixed(4)} BTC</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <h3 className="text-sm font-medium text-red-700">Overdue</h3>
          <p className="text-lg font-bold text-red-600">{totalOverdue.toFixed(4)} BTC</p>
        </div>
      </div>
      
      {/* Invoices list with clear label for amount */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 mb-3 sm:mb-0">
                  <h3 className="font-semibold text-gray-900">Invoice #{invoice.id}</h3>
                  <p className="text-sm text-gray-600">Client: {invoice.client}</p>
                  <p className="text-sm text-gray-600">Date: {invoice.date}</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Amount:</span> {invoice.amount.toFixed(4)} BTC
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    invoice.status === 'unpaid' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status === 'paid' ? 'Paid' : 
                     invoice.status === 'pending' ? 'Pending' :
                     invoice.status === 'unpaid' ? 'Unpaid' :
                     'Overdue'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            {filter === 'all' 
              ? 'No invoices found.' 
              : `No ${filter} invoices found.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default InvoiceSection;