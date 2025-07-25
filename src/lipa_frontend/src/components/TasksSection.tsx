// TasksSection.js with Amount label instead of a box
import { useState } from 'react';

const TasksSection = ({ tasks, addTask, completeTask, generateInvoice, invoices }) => {
  const [newTask, setNewTask] = useState({
    id: '',
    title: '',
    client: '',
    dueDate: '',
    amount: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle input changes for the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: name === 'amount' || name === 'id' ? (value === '' ? '' : Number(value)) : value
    });
  };

  // Submit new task
  const handleSubmit = (e) => {
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
      setNewTask({ id: '', title: '', client: '', dueDate: '', amount: '' });
      setShowAddForm(false);
    }
  };
  
  // Check if a task has an invoice
  const hasInvoice = (taskId) => {
    return invoices.some(invoice => invoice.taskId === taskId);
  };

  // Count tasks by status
  const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
  const completedCount = tasks.filter(task => task.status === 'completed').length;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          {showAddForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {/* Task statistics - simplified with just two boxes */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-sm text-gray-500">In Progress</h3>
          <p className="text-xl font-semibold">{inProgressCount}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-sm text-gray-500">Completed</h3>
          <p className="text-xl font-semibold">{completedCount}</p>
        </div>
      </div>

      {/* Add task form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">ID (positive number)</label>
              <input
                type="number"
                name="id"
                value={newTask.id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Client</label>
              <input
                type="text"
                name="client"
                value={newTask.client}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={newTask.dueDate}
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
                value={newTask.amount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
                min="0"
                step="0.0001"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
              >
                Add Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tasks list */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="border rounded-md p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                  <p className="text-sm text-gray-500">Client: {task.client}</p>
                  <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-700 font-medium mr-2">Amount:</span>
                    <span className="text-sm font-medium">{task.amount.toFixed(4)} BTC</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                  
                  {task.status === 'in-progress' && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                      Mark Complete
                    </button>
                  )}
                  
                  {task.status === 'completed' && !hasInvoice(task.id) && (
                    <button
                      onClick={() => generateInvoice(task.id)}
                      className="text-xs px-2 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
                    >
                      Generate Invoice
                    </button>
                  )}
                  
                  {task.status === 'completed' && hasInvoice(task.id) && (
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-md">
                      Invoice Created
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No tasks found. Add your first task!</p>
        )}
      </div>
    </div>
  );
};

export default TasksSection;