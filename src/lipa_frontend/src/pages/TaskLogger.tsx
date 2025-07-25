import { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, Plus, Edit, Trash2, Filter, Search, ArrowLeft } from 'lucide-react';
import { useTasks, useAddTask } from '../hooks/useQueries';

type Page = 'dashboard' | 'create-invoice' | 'admin' | 'task-logger';

interface TaskLoggerProps {
  onNavigate: (page: Page) => void;
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

interface Timer {
  isRunning: boolean;
  startTime: number;
  elapsedTime: number;
  taskId?: bigint;
}

const TaskLogger = ({ onNavigate }: TaskLoggerProps) => {
  const { data: tasks = [], isLoading } = useTasks();
  const addTaskMutation = useAddTask();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'timeSpent' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [timer, setTimer] = useState<Timer>({
    isRunning: false,
    startTime: 0,
    elapsedTime: 0
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    hours: 0,
    minutes: 0,
    tags: '',
    status: 'Pending' as const
  });

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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsedTime: Date.now() - prev.startTime + prev.elapsedTime
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime]);

  const startTimer = (taskId?: bigint) => {
    setTimer({
      isRunning: true,
      startTime: Date.now(),
      elapsedTime: timer.taskId === taskId ? timer.elapsedTime : 0,
      taskId
    });
  };

  const pauseTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: prev.elapsedTime + (Date.now() - prev.startTime)
    }));
  };

  const stopTimer = () => {
    if (timer.taskId) {
      const totalElapsed = timer.elapsedTime + (timer.isRunning ? Date.now() - timer.startTime : 0);
      const hours = Math.floor(totalElapsed / (1000 * 60 * 60));
      const minutes = Math.floor((totalElapsed % (1000 * 60 * 60)) / (1000 * 60));
      
      // Here you would update the task with the new time
      // For now, we'll just reset the timer
    }
    
    setTimer({
      isRunning: false,
      startTime: 0,
      elapsedTime: 0,
      taskId: undefined
    });
  };

  const formatTimerTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentTimerTime = () => {
    if (!timer.isRunning) return formatTimerTime(timer.elapsedTime);
    return formatTimerTime(timer.elapsedTime + (Date.now() - timer.startTime));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title) {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        timeSpent: { hours: newTask.hours, minutes: newTask.minutes },
        tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: newTask.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addTaskMutation.mutateAsync({
        id: BigInt(Date.now()),
        description: JSON.stringify(taskData)
      });
      
      setNewTask({
        title: '',
        description: '',
        hours: 0,
        minutes: 0,
        tags: '',
        status: 'Pending'
      });
      setShowAddForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeSpent: { hours: number; minutes: number }) => {
    const { hours, minutes } = timeSpent;
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Filter and sort tasks
  const filteredTasks = parsedTasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'timeSpent':
          const aTime = a.timeSpent.hours * 60 + a.timeSpent.minutes;
          const bTime = b.timeSpent.hours * 60 + b.timeSpent.minutes;
          comparison = aTime - bTime;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Task Logger</h1>
        <p className="text-gray-600">Manage your tasks and track time efficiently</p>
      </div>

      {/* Timer Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Timer</h2>
              <p className="text-2xl font-mono font-bold text-orange-600">
                {getCurrentTimerTime()}
              </p>
              {timer.taskId && (
                <p className="text-sm text-gray-600">
                  Tracking: {parsedTasks.find(t => t.id === timer.taskId)?.title || 'Unknown Task'}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {!timer.isRunning ? (
              <button
                onClick={() => startTimer()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </button>
            )}
            <button
              onClick={stopTimer}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </button>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="status-asc">Status A-Z</option>
              <option value="timeSpent-desc">Most Time</option>
              <option value="timeSpent-asc">Least Time</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="input-field"
                required
              />
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as any })}
                className="input-field"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="input-field"
              rows={3}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Hours"
                min="0"
                value={newTask.hours}
                onChange={(e) => setNewTask({ ...newTask, hours: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Minutes"
                min="0"
                max="59"
                value={newTask.minutes}
                onChange={(e) => setNewTask({ ...newTask, minutes: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={newTask.tags}
                onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={addTaskMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {addTaskMutation.isPending ? 'Adding...' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Tasks ({filteredTasks.length})
          </h3>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found</p>
              <p className="text-sm text-gray-400">
                {searchTerm || statusFilter !== 'All' ? 'Try adjusting your filters' : 'Add your first task to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id.toString()} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {timer.taskId === task.id && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                            Tracking
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(task.timeSpent)}
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex gap-1">
                            {task.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {timer.taskId !== task.id && (
                        <button
                          onClick={() => startTimer(task.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Start timer for this task"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit task"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskLogger;
