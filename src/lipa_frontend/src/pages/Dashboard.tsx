// Dashboard.js
import { useState } from 'react';
import InvoiceSection from '../components/InvoiceSection';
import TasksSection from '../components/TasksSection';
import BadgesSection from '../components/BadgesSection';
import TeamPaymentsSection from '../components/TeamPaymentsSection';
import TopPerformerShowcase from '../components/TopPerformerShowcase';
import { Search, MessageCircle, Bell, ChevronDown, Calendar, Download, Filter } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  client: string;
  dueDate: string;
  status: 'in-progress' | 'completed';
  amount: number;
}

interface Invoice {
  id: number;
  taskId: number | null;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'unpaid' | 'overdue';
  date: string;
}

const Dashboard = () => {
  // Sample data for tasks and invoices with more examples
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Website Redesign', client: 'Acme Inc', dueDate: '2025-08-15', status: 'in-progress', amount: 0.012 },
    { id: 2, title: 'Logo Creation', client: 'TechStart', dueDate: '2025-07-30', status: 'completed', amount: 0.005 },
    { id: 3, title: 'Mobile App UI', client: 'FitLife', dueDate: '2025-08-20', status: 'completed', amount: 0.008 },
    { id: 4, title: 'Marketing Materials', client: 'Brew Co', dueDate: '2025-09-01', status: 'in-progress', amount: 0.0065 },
    { id: 5, title: 'E-commerce Integration', client: 'FashionStore', dueDate: '2025-08-10', status: 'in-progress', amount: 0.0175 },
    { id: 6, title: 'SEO Optimization', client: 'Travel Agency', dueDate: '2025-07-28', status: 'completed', amount: 0.003 },
    { id: 7, title: 'Social Media Campaign', client: 'Organic Foods', dueDate: '2025-08-25', status: 'in-progress', amount: 0.0095 },
    { id: 8, title: 'Product Photography', client: 'Handmade Crafts', dueDate: '2025-08-05', status: 'completed', amount: 0.0042 },
    { id: 9, title: 'Blog Content Creation', client: 'Health Clinic', dueDate: '2025-08-30', status: 'in-progress', amount: 0.0085 },
    { id: 10, title: 'Email Template Design', client: 'Online Store', dueDate: '2025-07-29', status: 'completed', amount: 0.0035 }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 101, taskId: 2, client: 'TechStart', amount: 0.005, status: 'paid', date: '2025-07-25' },
    { id: 102, taskId: 3, client: 'FitLife', amount: 0.008, status: 'pending', date: '2025-07-22' },
    { id: 103, taskId: 6, client: 'Travel Agency', amount: 0.003, status: 'paid', date: '2025-07-29' },
    { id: 104, taskId: null, client: 'Creative Studio', amount: 0.0115, status: 'pending', date: '2025-07-20' },
    { id: 105, taskId: null, client: 'Local Restaurant', amount: 0.0028, status: 'paid', date: '2025-07-15' },
    { id: 106, taskId: 8, client: 'Handmade Crafts', amount: 0.0042, status: 'pending', date: '2025-08-01' },
    { id: 107, taskId: null, client: 'Tech Conference', amount: 0.0135, status: 'pending', date: '2025-07-18' }
  ]);

  // Add a new task (with ID validation)
  const addTask = (newTask: Task) => {
    if (newTask.id <= 0) {
      alert("Task ID must be greater than 0");
      return false;
    }
    setTasks([...tasks, newTask]);
    return true;
  };

  // Mark a task as completed
  const completeTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'completed' } : task
    ));
  };

  // Generate an invoice for a task
  const generateInvoice = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newInvoice: Invoice = {
      id: Date.now(),
      taskId: task.id,
      client: task.client,
      amount: task.amount,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    
    setInvoices([...invoices, newInvoice]);
  };

  // Create a direct invoice
  const createDirectInvoice = (invoiceData: { client: string; amount: number }) => {
    const newInvoice: Invoice = {
      id: Date.now(),
      taskId: null,
      ...invoiceData,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    
    setInvoices([...invoices, newInvoice]);
  };

  // Calculate overview metrics
  const totalInvoices = invoices.length;
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalUnpaid = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  // Count invoices by status
  const draftCount = invoices.filter(inv => inv.status === 'pending').length;
  const unpaidCount = invoices.filter(inv => inv.status === 'unpaid').length;
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;
  const pendingCount = invoices.filter(inv => inv.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        {/* Overview Section */}
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

          <div className="flex justify-end">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">19 Nov 2023</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Invoices</h2>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Import</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                <span>+ New Invoice</span>
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-6">
            <button className="text-sm font-medium text-green-600 border-b-2 border-green-600 pb-2 whitespace-nowrap">
              All Invoices
            </button>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-2 whitespace-nowrap">
              Drafts
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">3</span>
            </button>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-2 whitespace-nowrap">
              Unpaid
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">4</span>
            </button>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-2 whitespace-nowrap">
              Paid
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">7</span>
            </button>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-2 whitespace-nowrap">
              Pending
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">8</span>
            </button>
          </div>

          {/* Search and Filter */}
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
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Invoices Table */}
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
                  {invoices.slice(0, 7).map((invoice, index) => (
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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
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

        {/* Additional Dashboard Sections */}
        <div className="">
            <TasksSection 
              tasks={tasks} 
              addTask={addTask} 
              completeTask={completeTask} 
              generateInvoice={generateInvoice} 
              invoices={invoices} 
            />
          
          
          <div className="flex flex-col md:flex-row mt-4 gap-4">
            <BadgesSection />
            <TeamPaymentsSection />
          </div>
          
          <div className="xl:col-span-3">
           
          </div>
          
          <div className="xl:col-span-3">
            <TopPerformerShowcase />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;