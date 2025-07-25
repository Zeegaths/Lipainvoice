// InvoiceSection.js - Updated with more dummy data and label changes
import { useState } from 'react';

const InvoiceSection = ({ invoices: propInvoices = [], createDirectInvoice }) => {
  // Add more dummy data for demonstration
  const dummyInvoices = [
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
  
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'paid'
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    client: '',
    amount: ''
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
  
  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice({
      ...newInvoice,
      [name]: name === 'amount' ? (value === '' ? '' : Number(value)) : value
    });
  };
  
  // Create a new direct invoice
  const handleSubmit = (e) => {
    e.preventDefault();
    createDirectInvoice(newInvoice);
    setNewInvoice({ client: '', amount: '' });
    setShowAddForm(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Invoices</h2>
        <div className="flex space-x-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="p-1 border rounded-md text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm"
          >
            {showAddForm ? 'Cancel' : 'Create Invoice'}
          </button>
        </div>
      </div>
      
      {/* Direct invoice creation form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Client</label>
              <input
                type="text"
                name="client"
                value={newInvoice.client}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount (BTC)</label>
              <input
                type="number"
                name="amount"
                value={newInvoice.amount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
                min="0"
                step="0.0001"
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </form>
      )}
      
      {/* Invoice stats */}
      <div className="bg-gray-50 p-3 rounded-md mb-4">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm text-gray-500">Paid</h3>
            <p className="text-xl font-semibold text-green-600">{totalPaid.toFixed(4)} BTC</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500">Pending</h3>
            <p className="text-xl font-semibold text-yellow-600">{totalPending.toFixed(4)} BTC</p>
          </div>
        </div>
      </div>
      
      {/* Invoices list with clear label for amount */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="border rounded-md p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">Invoice #{invoice.id}</h3>
                  <p className="text-sm text-gray-500">Client: {invoice.client}</p>
                  <p className="text-sm text-gray-500">Date: {invoice.date}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Amount:</span> {invoice.amount.toFixed(4)} BTC
                  </p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
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