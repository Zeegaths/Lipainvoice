// Dashboard.js
import { useState } from 'react';
import InvoiceSection from '../components/InvoiceSection';
import TasksSection from '../components/TasksSection';
import BadgesSection from '../components/BadgesSection';
import TeamPaymentsSection from '../components/TeamPaymentsSection';
import TopPerformerShowcase from '../components/TopPerformerShowcase';

const Dashboard = () => {
  // Sample data for tasks and invoices with more examples
  const [tasks, setTasks] = useState([
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

  const [invoices, setInvoices] = useState([
    { id: 101, taskId: 2, client: 'TechStart', amount: 0.005, status: 'paid', date: '2025-07-25' },
    { id: 102, taskId: 3, client: 'FitLife', amount: 0.008, status: 'pending', date: '2025-07-22' },
    { id: 103, taskId: 6, client: 'Travel Agency', amount: 0.003, status: 'paid', date: '2025-07-29' },
    { id: 104, taskId: null, client: 'Creative Studio', amount: 0.0115, status: 'pending', date: '2025-07-20' },
    { id: 105, taskId: 8, client: 'Handmade Crafts', amount: 0.0042, status: 'pending', date: '2025-08-01' },
    { id: 106, taskId: 10, client: 'Online Store', amount: 0.0035, status: 'paid', date: '2025-07-30' },
    { id: 107, taskId: null, client: 'Local Restaurant', amount: 0.0028, status: 'paid', date: '2025-07-15' },
    { id: 108, taskId: null, client: 'Fitness Center', amount: 0.0065, status: 'pending', date: '2025-08-03' }
  ]);

  // Add a new task (with ID validation)
  const addTask = (newTask) => {
    if (newTask.id <= 0) {
      alert("Task ID must be greater than 0");
      return false;
    }
    setTasks([...tasks, newTask]);
    return true;
  };

  // Mark a task as completed
  const completeTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'completed' } : task
    ));
  };

  // Generate an invoice for a task
  const generateInvoice = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newInvoice = {
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
  const createDirectInvoice = (invoiceData) => {
    const newInvoice = {
      id: Date.now(),
      ...invoiceData,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    
    setInvoices([...invoices, newInvoice]);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your freelance work.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <InvoiceSection 
          invoices={invoices} 
          createDirectInvoice={createDirectInvoice} 
        />
        
        <TasksSection 
          tasks={tasks} 
          addTask={addTask} 
          completeTask={completeTask} 
          generateInvoice={generateInvoice} 
          invoices={invoices} 
        />
        
        <BadgesSection />
        <div className="lg:col-span-2 xl:col-span-3">
          <TeamPaymentsSection />
        </div>
        <div className="lg:col-span-2 xl:col-span-3">
          <TopPerformerShowcase />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;