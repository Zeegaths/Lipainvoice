// TasksSection.js with Amount label instead of a box
import { useState } from 'react';

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
  status: string;
  date: string;
}

interface TasksSectionProps {
  tasks: Task[];
  addTask: (task: Task) => boolean;
  completeTask: (taskId: number) => void;
  generateInvoice: (taskId: number) => void;
  invoices: Invoice[];
}

const TasksSection = ({ tasks, addTask, completeTask, generateInvoice, invoices }: TasksSectionProps) => {
  const [newTask, setNewTask] = useState<{
    id: number;
    title: string;
    client: string;
    dueDate: string;
    amount: number;
  }>({
    id: 0,
    title: '',
    client: '',
    dueDate: '',
    amount: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle input changes for the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'amount' || name === 'id') {
      setNewTask({
        ...newTask,
        [name]: value === '' ? 0 : Number(value)
      });
    } else {
      setNewTask({
        ...newTask,
        [name]: value
      });
    }
  };

  // Submit new task
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newTask.id <= 0) {
      alert("Task ID must be greater than 0");
      return;
    }
    
    const success = addTask({
      ...newTask,
      status: 'in-progress'
    });
    
    if (success) {
      setNewTask({ id: 0, title: '', client: '', dueDate: '', amount: 0 });
      setShowAddForm(false);
    }
  };
  
  // Check if a task has an invoice
  const hasInvoice = (taskId: number) => {
    return invoices.some(invoice => invoice.taskId === taskId);
  };

  // Count tasks by status
  const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
  const completedCount = tasks.filter(task => task.status === 'completed').length;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-0">Tasks</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          {showAddForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {/* Task statistics - simplified with just two boxes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
          <h3 className="text-sm font-medium text-gray-600">In Progress</h3>
          <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
          <h3 className="text-sm font-medium text-gray-600">Completed</h3>
          <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
        </div>
      </div>

      {/* Add task form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-300">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID (positive number)</label>
                <input
                  type="number"
                  name="id"
                  value={newTask.id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newTask.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <input
                  type="text"
                  name="client"
                  value={newTask.client}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={newTask.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (BTC)</label>
                <input
                  type="number"
                  name="amount"
                  value={newTask.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.0001"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tasks list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 mb-3 sm:mb-0">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600">Client: {task.client}</p>
                  <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-700 font-medium mr-2">Amount:</span>
                    <span className="text-sm font-semibold text-gray-900">{task.amount.toFixed(4)} BTC</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                  
                  {task.status === 'in-progress' && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Mark Complete
                    </button>
                  )}
                  
                  {task.status === 'completed' && !hasInvoice(task.id) && (
                    <button
                      onClick={() => generateInvoice(task.id)}
                      className="text-xs px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                    >
                      Generate Invoice
                    </button>
                  )}
                  
                  {task.status === 'completed' && hasInvoice(task.id) && (
                    <span className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-lg font-medium">
                      Invoice Created
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No tasks found. Add your first task!</p>
        )}
      </div>
    </div>
  );
};

export default TasksSection;