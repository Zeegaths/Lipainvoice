import { useState } from 'react';
import { Shield, Users, FileText, CheckSquare, Award, Edit, Trash2, Plus, Search, File, Download, Eye, HardDrive, Calendar, TrendingUp, BarChart3, PieChart, Activity, Trophy, Crown, Diamond, Medal, Target, Star, Zap, Flame, Gem, Sparkles } from 'lucide-react';
import { 
  useIsCurrentUserAdmin, 
  useAdminAllInvoices, 
  useAdminAllTasks, 
  useAdminAllBadges,
  useAdminAllFiles,
  useAdminUpdateInvoice,
  useAdminDeleteInvoice,
  useAdminUpdateTask,
  useAdminDeleteTask,
  useAddInvoice,
  useAddTask
} from '../hooks/useQueries';

interface EditingItem {
  type: 'invoice' | 'task';
  userId: string;
  id: bigint;
  currentValue: string;
}

interface BadgeTier {
  name: string;
  level: number;
  color: string;
  icon: any;
}

interface TopBadgeEarner {
  userId: string;
  userName: string;
  currentTier: string;
  totalBadges: number;
  recentAchievements: number;
  averageRating: number;
  tierProgression: string[];
  specialAchievements: string[];
}

interface BadgeDistributionData {
  tier: string;
  count: number;
  percentage: number;
  growth: number;
  monthlyGrowth: number;
}

interface MilestoneAchievement {
  userId: string;
  userName: string;
  milestone: string;
  achievedAt: string;
  category: string;
  tierLevel: number;
  impact: string;
}

interface BadgeCategory {
  name: string;
  count: number;
  topEarners: string[];
  averageTime: number;
}

interface AnalyticsData {
  invoiceStats: {
    total: number;
    pending: number;
    paid: number;
    distributed: number;
    totalBtc: number;
    totalUsd: number;
    monthlyTrend: Array<{ month: string; count: number; amount: number }>;
  };
  taskStats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    completionRate: number;
    avgTimeSpent: number;
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
  };
  paymentStats: {
    teamInvoices: number;
    soloInvoices: number;
    avgTeamSize: number;
    totalDistributed: number;
  };
  badgeStats: {
    totalBadges: number;
    mostCommonBadges: Array<{ name: string; count: number }>;
    avgBadgesPerUser: number;
    tierDistribution: BadgeDistributionData[];
    topEarners: TopBadgeEarner[];
    recentMilestones: MilestoneAchievement[];
    badgeProgression: Array<{ 
      month: string; 
      bronze: number; 
      silver: number; 
      gold: number; 
      platinum: number; 
      diamond: number; 
      elite: number;
      legendary: number;
    }>;
    categoryBreakdown: BadgeCategory[];
    tierAdvancementRate: number;
    averageTimeToAdvancement: number;
    retentionByTier: Array<{ tier: string; retentionRate: number }>;
    engagementMetrics: {
      badgeViewsPerUser: number;
      profileCompletionRate: number;
      achievementShareRate: number;
    };
  };
  fileStats: {
    totalFiles: number;
    totalStorage: number;
    avgFileSize: number;
    fileTypeDistribution: Array<{ type: string; count: number }>;
  };
}

const BADGE_TIERS: BadgeTier[] = [
  { name: 'Bronze', level: 1, color: 'text-orange-600', icon: Medal },
  { name: 'Silver', level: 2, color: 'text-gray-600', icon: Award },
  { name: 'Gold', level: 3, color: 'text-yellow-600', icon: Trophy },
  { name: 'Platinum', level: 4, color: 'text-blue-600', icon: Shield },
  { name: 'Diamond', level: 5, color: 'text-purple-600', icon: Diamond },
  { name: 'Elite', level: 6, color: 'text-indigo-600', icon: Crown },
  { name: 'Legendary', level: 7, color: 'text-pink-600', icon: Sparkles }
];

const AdminDashboard = () => {
  const { data: isAdmin = false, isLoading } = useIsCurrentUserAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddForm, setShowAddForm] = useState<{ type: 'invoice' | 'task' | null; userId?: string }>({ type: null });
  const [newItemData, setNewItemData] = useState({ id: '', value: '' });
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30d');
  const [badgeAnalyticsView, setBadgeAnalyticsView] = useState<'overview' | 'tiers' | 'milestones' | 'trends'>('overview');

  // Admin data queries
  const { data: allInvoices = [], isLoading: loadingInvoices } = useAdminAllInvoices();
  const { data: allTasks = [], isLoading: loadingTasks } = useAdminAllTasks();
  const { data: allBadges = [], isLoading: loadingBadges } = useAdminAllBadges();
  const { data: allFiles = [], isLoading: loadingFiles } = useAdminAllFiles();

  // Admin mutations
  const updateInvoiceMutation = useAdminUpdateInvoice();
  const deleteInvoiceMutation = useAdminDeleteInvoice();
  const updateTaskMutation = useAdminUpdateTask();
  const deleteTaskMutation = useAdminDeleteTask();
  const addInvoiceMutation = useAddInvoice();
  const addTaskMutation = useAddTask();

  // Enhanced analytics data with comprehensive badge metrics
  const analyticsData: AnalyticsData = {
    invoiceStats: {
      total: allInvoices.reduce((sum, user) => sum + user.invoices.length, 0),
      pending: Math.floor(allInvoices.reduce((sum, user) => sum + user.invoices.length, 0) * 0.4),
      paid: Math.floor(allInvoices.reduce((sum, user) => sum + user.invoices.length, 0) * 0.45),
      distributed: Math.floor(allInvoices.reduce((sum, user) => sum + user.invoices.length, 0) * 0.15),
      totalBtc: 12.45678901,
      totalUsd: 560250,
      monthlyTrend: [
        { month: 'Jan', count: 15, amount: 2.1 },
        { month: 'Feb', count: 22, amount: 3.2 },
        { month: 'Mar', count: 18, amount: 2.8 },
        { month: 'Apr', count: 28, amount: 4.1 },
        { month: 'May', count: 35, amount: 5.3 },
        { month: 'Jun', count: 31, amount: 4.7 }
      ]
    },
    taskStats: {
      total: allTasks.reduce((sum, user) => sum + user.tasks.length, 0),
      pending: Math.floor(allTasks.reduce((sum, user) => sum + user.tasks.length, 0) * 0.3),
      inProgress: Math.floor(allTasks.reduce((sum, user) => sum + user.tasks.length, 0) * 0.25),
      completed: Math.floor(allTasks.reduce((sum, user) => sum + user.tasks.length, 0) * 0.45),
      completionRate: 78.5,
      avgTimeSpent: 4.2
    },
    userStats: {
      totalUsers: new Set([
        ...allInvoices.map(u => u.user), 
        ...allTasks.map(u => u.user), 
        ...allBadges.map(u => u.user),
        ...allFiles.map(u => u.user)
      ]).size,
      activeUsers: Math.floor(new Set([
        ...allInvoices.map(u => u.user), 
        ...allTasks.map(u => u.user)
      ]).size * 0.85),
      newUsersThisMonth: 12,
      userGrowthRate: 15.3
    },
    paymentStats: {
      teamInvoices: Math.floor(allInvoices.reduce((sum, user) => sum + user.invoices.length, 0) * 0.35),
      soloInvoices: Math.floor(allInvoices.reduce((sum, user) => sum + user.invoices.length, 0) * 0.65),
      avgTeamSize: 3.2,
      totalDistributed: 8.92345678
    },
    badgeStats: {
      totalBadges: allBadges.reduce((sum, user) => sum + user.badges.length, 0),
      mostCommonBadges: [
        { name: 'Reliable Partner', count: 23 },
        { name: 'Expert Developer', count: 18 },
        { name: 'Client Favorite', count: 15 },
        { name: 'Quality Assurance', count: 12 },
        { name: 'Innovation Leader', count: 10 },
        { name: 'Bitcoin Specialist', count: 8 }
      ],
      avgBadgesPerUser: 4.2,
      tierDistribution: [
        { tier: 'Bronze', count: 52, percentage: 32, growth: 15, monthlyGrowth: 8 },
        { tier: 'Silver', count: 38, percentage: 23, growth: 12, monthlyGrowth: 6 },
        { tier: 'Gold', count: 34, percentage: 21, growth: 18, monthlyGrowth: 9 },
        { tier: 'Platinum', count: 22, percentage: 13, growth: 28, monthlyGrowth: 12 },
        { tier: 'Diamond', count: 12, percentage: 7, growth: 45, monthlyGrowth: 18 },
        { tier: 'Elite', count: 5, percentage: 3, growth: 67, monthlyGrowth: 25 },
        { tier: 'Legendary', count: 2, percentage: 1, growth: 100, monthlyGrowth: 50 }
      ],
      topEarners: [
        { 
          userId: 'user1', 
          userName: 'Alex Johnson', 
          currentTier: 'Legendary', 
          totalBadges: 18, 
          recentAchievements: 4, 
          averageRating: 4.95,
          tierProgression: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'Legendary'],
          specialAchievements: ['Platform Pioneer', 'Innovation Award', 'Community Leader']
        },
        { 
          userId: 'user2', 
          userName: 'Sarah Chen', 
          currentTier: 'Elite', 
          totalBadges: 15, 
          recentAchievements: 3, 
          averageRating: 4.9,
          tierProgression: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite'],
          specialAchievements: ['Technical Excellence', 'Mentor Award']
        },
        { 
          userId: 'user3', 
          userName: 'Mike Rodriguez', 
          currentTier: 'Diamond', 
          totalBadges: 12, 
          recentAchievements: 5, 
          averageRating: 4.85,
          tierProgression: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
          specialAchievements: ['Client Champion', 'Quality Master']
        },
        { 
          userId: 'user4', 
          userName: 'Emma Wilson', 
          currentTier: 'Platinum', 
          totalBadges: 10, 
          recentAchievements: 3, 
          averageRating: 4.8,
          tierProgression: ['Bronze', 'Silver', 'Gold', 'Platinum'],
          specialAchievements: ['Rising Star', 'Collaboration Expert']
        },
        { 
          userId: 'user5', 
          userName: 'David Kim', 
          currentTier: 'Gold', 
          totalBadges: 8, 
          recentAchievements: 2, 
          averageRating: 4.75,
          tierProgression: ['Bronze', 'Silver', 'Gold'],
          specialAchievements: ['Consistent Performer']
        }
      ],
      recentMilestones: [
        { 
          userId: 'user1', 
          userName: 'Alex Johnson', 
          milestone: 'Reached Legendary Tier', 
          achievedAt: '2025-01-18', 
          category: 'Tier Advancement',
          tierLevel: 7,
          impact: 'Platform Hall of Fame Induction'
        },
        { 
          userId: 'user6', 
          userName: 'Lisa Park', 
          milestone: '100 Projects Milestone', 
          achievedAt: '2025-01-17', 
          category: 'Project Achievement',
          tierLevel: 4,
          impact: 'Platinum Tier Qualification'
        },
        { 
          userId: 'user2', 
          userName: 'Sarah Chen', 
          milestone: '2 BTC Total Earnings', 
          achievedAt: '2025-01-15', 
          category: 'Earnings Milestone',
          tierLevel: 6,
          impact: 'Elite Tier Advancement'
        },
        { 
          userId: 'user7', 
          userName: 'James Wilson', 
          milestone: 'Perfect 5.0 Rating Streak (3 months)', 
          achievedAt: '2025-01-14', 
          category: 'Rating Achievement',
          tierLevel: 3,
          impact: 'Gold Tier Advancement'
        },
        { 
          userId: 'user3', 
          userName: 'Mike Rodriguez', 
          milestone: 'Diamond Tier Achievement', 
          achievedAt: '2025-01-12', 
          category: 'Tier Advancement',
          tierLevel: 5,
          impact: 'VIP Status Unlocked'
        },
        { 
          userId: 'user8', 
          userName: 'Anna Thompson', 
          milestone: 'First Repeat Client Milestone', 
          achievedAt: '2025-01-10', 
          category: 'Client Relations',
          tierLevel: 2,
          impact: 'Silver Tier Advancement'
        }
      ],
      badgeProgression: [
        { month: 'Jan', bronze: 52, silver: 38, gold: 34, platinum: 22, diamond: 12, elite: 5, legendary: 2 },
        { month: 'Feb', bronze: 55, silver: 42, gold: 36, platinum: 24, diamond: 13, elite: 5, legendary: 2 },
        { month: 'Mar', bronze: 58, silver: 45, gold: 39, platinum: 26, diamond: 14, elite: 6, legendary: 2 },
        { month: 'Apr', bronze: 62, silver: 48, gold: 42, platinum: 28, diamond: 15, elite: 6, legendary: 3 },
        { month: 'May', bronze: 65, silver: 52, gold: 45, platinum: 31, diamond: 17, elite: 7, legendary: 3 },
        { month: 'Jun', bronze: 68, silver: 55, gold: 48, platinum: 34, diamond: 19, elite: 8, legendary: 4 }
      ],
      categoryBreakdown: [
        { name: 'Technical Excellence', count: 45, topEarners: ['Alex Johnson', 'Sarah Chen', 'Mike Rodriguez'], averageTime: 3.2 },
        { name: 'Client Relations', count: 38, topEarners: ['Emma Wilson', 'David Kim', 'Lisa Park'], averageTime: 2.8 },
        { name: 'Innovation', count: 32, topEarners: ['Alex Johnson', 'James Wilson', 'Anna Thompson'], averageTime: 4.1 },
        { name: 'Leadership', count: 28, topEarners: ['Sarah Chen', 'Mike Rodriguez', 'Emma Wilson'], averageTime: 5.5 },
        { name: 'Specialization', count: 24, topEarners: ['Alex Johnson', 'David Kim', 'Lisa Park'], averageTime: 6.2 },
        { name: 'Community', count: 19, topEarners: ['Sarah Chen', 'James Wilson', 'Anna Thompson'], averageTime: 4.8 }
      ],
      tierAdvancementRate: 23.5,
      averageTimeToAdvancement: 2.8,
      retentionByTier: [
        { tier: 'Bronze', retentionRate: 78 },
        { tier: 'Silver', retentionRate: 85 },
        { tier: 'Gold', retentionRate: 92 },
        { tier: 'Platinum', retentionRate: 96 },
        { tier: 'Diamond', retentionRate: 98 },
        { tier: 'Elite', retentionRate: 100 },
        { tier: 'Legendary', retentionRate: 100 }
      ],
      engagementMetrics: {
        badgeViewsPerUser: 12.4,
        profileCompletionRate: 87.3,
        achievementShareRate: 34.2
      }
    },
    fileStats: {
      totalFiles: allFiles.reduce((sum, user) => sum + user.files.length, 0),
      totalStorage: 2.4,
      avgFileSize: 1.2,
      fileTypeDistribution: [
        { type: 'PDF', count: 45 },
        { type: 'PNG', count: 32 },
        { type: 'DOCX', count: 28 },
        { type: 'JPG', count: 21 },
        { type: 'ZIP', count: 12 }
      ]
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Shield },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'badge-analytics', name: 'Badge Analytics', icon: Trophy },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'invoices', name: 'All Invoices', icon: FileText },
    { id: 'tasks', name: 'All Tasks', icon: CheckSquare },
    { id: 'badges', name: 'All Badges', icon: Award },
    { id: 'files', name: 'All Files', icon: File },
  ];

  const handleEdit = (type: 'invoice' | 'task', userId: string, id: bigint, currentValue: string) => {
    setEditingItem({ type, userId, id, currentValue });
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      if (editingItem.type === 'invoice') {
        await updateInvoiceMutation.mutateAsync({
          userId: editingItem.userId,
          id: editingItem.id,
          details: editValue
        });
      } else {
        await updateTaskMutation.mutateAsync({
          userId: editingItem.userId,
          id: editingItem.id,
          description: editValue
        });
      }
      setEditingItem(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. This feature requires backend implementation.');
    }
  };

  const handleDelete = async (type: 'invoice' | 'task', userId: string, id: bigint) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === 'invoice') {
        await deleteInvoiceMutation.mutateAsync({ userId, id });
      } else {
        await deleteTaskMutation.mutateAsync({ userId, id });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. This feature requires backend implementation.');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddForm.type || !newItemData.id || !newItemData.value) return;

    try {
      if (showAddForm.type === 'invoice') {
        await addInvoiceMutation.mutateAsync({
          id: BigInt(newItemData.id),
          details: newItemData.value
        });
      } else {
        await addTaskMutation.mutateAsync({
          id: BigInt(newItemData.id),
          description: newItemData.value
        });
      }
      setShowAddForm({ type: null });
      setNewItemData({ id: '', value: '' });
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item.');
    }
  };

  const handleFileView = (file: any) => {
    const fileUrl = `/api/files/${file.path}`;
    if (file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf') {
      window.open(fileUrl, '_blank');
    } else {
      handleFileDownload(file);
    }
  };

  const handleFileDownload = (file: any) => {
    const fileUrl = `/api/files/${file.path}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name || file.path.split('/').pop() || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: bigint) => {
    const size = Number(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType === 'application/zip') return '📦';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '📝';
    return '📁';
  };

  const getTierIcon = (tierName: string) => {
    const tier = BADGE_TIERS.find(t => t.name === tierName);
    return tier ? tier.icon : Award;
  };

  const getTierColor = (tierName: string) => {
    const tier = BADGE_TIERS.find(t => t.name === tierName);
    return tier ? tier.color : 'text-gray-600';
  };

  const filteredInvoices = allInvoices.filter(userInvoices =>
    userInvoices.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userInvoices.invoices.some(([_, invoice]) => 
      invoice.details.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredTasks = allTasks.filter(userTasks =>
    userTasks.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userTasks.tasks.some(([_, description]) => description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredFiles = allFiles.filter(userFiles =>
    userFiles.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userFiles.files.some(file => 
      file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.path.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage all users and platform data with advanced badge analytics</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{analyticsData.userStats.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-semibold text-gray-900">{analyticsData.invoiceStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-semibold text-gray-900">{analyticsData.taskStats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Badges</p>
                  <p className="text-2xl font-semibold text-gray-900">{analyticsData.badgeStats.totalBadges}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <File className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl font-semibold text-gray-900">{analyticsData.fileStats.totalFiles}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badge-analytics' && (
          <div className="space-y-8">
            {/* Badge Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Comprehensive Badge System Analytics</h2>
                <p className="text-gray-600">Deep insights into freelancer achievements, tier progression, and milestone tracking</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={badgeAnalyticsView}
                  onChange={(e) => setBadgeAnalyticsView(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="overview">Overview</option>
                  <option value="tiers">Tier Analysis</option>
                  <option value="milestones">Milestones</option>
                  <option value="trends">Trends</option>
                </select>
                <select
                  value={analyticsDateRange}
                  onChange={(e) => setAnalyticsDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
            </div>

            {/* Badge Analytics Overview */}
            {badgeAnalyticsView === 'overview' && (
              <>
                {/* Key Badge Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100">Total Badge Earners</p>
                        <p className="text-3xl font-bold">{analyticsData.badgeStats.tierDistribution.reduce((sum, tier) => sum + tier.count, 0)}</p>
                        <p className="text-sm text-yellow-100">Across all tiers</p>
                      </div>
                      <Trophy className="h-10 w-10 text-yellow-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Tier Advancement Rate</p>
                        <p className="text-3xl font-bold">{analyticsData.badgeStats.tierAdvancementRate}%</p>
                        <p className="text-sm text-purple-100">Monthly progression</p>
                      </div>
                      <TrendingUp className="h-10 w-10 text-purple-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Avg Badges per User</p>
                        <p className="text-3xl font-bold">{analyticsData.badgeStats.avgBadgesPerUser}</p>
                        <p className="text-sm text-blue-100">Platform average</p>
                      </div>
                      <Award className="h-10 w-10 text-blue-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Elite+ Tier Users</p>
                        <p className="text-3xl font-bold">{analyticsData.badgeStats.tierDistribution.filter(t => ['Elite', 'Legendary'].includes(t.tier)).reduce((sum, tier) => sum + tier.count, 0)}</p>
                        <p className="text-sm text-green-100">Top performers</p>
                      </div>
                      <Crown className="h-10 w-10 text-green-200" />
                    </div>
                  </div>
                </div>

                {/* Top Badge Earners - Enhanced */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Top Badge Earners & Accomplishments</h3>
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="space-y-6">
                    {analyticsData.badgeStats.topEarners.map((earner, index) => {
                      const TierIcon = getTierIcon(earner.currentTier);
                      const tierColor = getTierColor(earner.currentTier);
                      
                      return (
                        <div key={earner.userId} className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mr-4">
                                <span className="text-lg font-bold text-yellow-700">#{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <TierIcon className={`h-6 w-6 ${tierColor} mr-2`} />
                                  <h4 className="text-lg font-semibold text-gray-900">{earner.userName}</h4>
                                  <span className={`ml-3 px-3 py-1 text-sm rounded-full bg-gradient-to-r ${
                                    earner.currentTier === 'Legendary' ? 'from-pink-100 to-purple-100 text-pink-800' :
                                    earner.currentTier === 'Elite' ? 'from-indigo-100 to-blue-100 text-indigo-800' :
                                    earner.currentTier === 'Diamond' ? 'from-purple-100 to-pink-100 text-purple-800' :
                                    'from-blue-100 to-indigo-100 text-blue-800'
                                  }`}>
                                    {earner.currentTier} Tier
                                  </span>
                                </div>
                                
                                {/* Tier Progression */}
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600 mb-2">Tier Progression Journey:</p>
                                  <div className="flex items-center space-x-2">
                                    {earner.tierProgression.map((tier, tierIndex) => {
                                      const TierProgressIcon = getTierIcon(tier);
                                      const isCurrentTier = tier === earner.currentTier;
                                      return (
                                        <div key={tier} className="flex items-center">
                                          <div className={`p-1 rounded-full ${isCurrentTier ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                                            <TierProgressIcon className={`h-4 w-4 ${isCurrentTier ? getTierColor(tier) : 'text-gray-400'}`} />
                                          </div>
                                          {tierIndex < earner.tierProgression.length - 1 && (
                                            <div className="w-4 h-0.5 bg-gray-300 mx-1"></div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Special Achievements */}
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600 mb-2">Special Achievements:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {earner.specialAchievements.map((achievement, achIndex) => (
                                      <span key={achIndex} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                        {achievement}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div className="text-center p-2 bg-white rounded">
                                    <div className="flex items-center justify-center mb-1">
                                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                                      <span className="font-semibold">{earner.averageRating}</span>
                                    </div>
                                    <p className="text-gray-600">Rating</p>
                                  </div>
                                  <div className="text-center p-2 bg-white rounded">
                                    <p className="font-semibold text-blue-600">{earner.totalBadges}</p>
                                    <p className="text-gray-600">Total Badges</p>
                                  </div>
                                  <div className="text-center p-2 bg-white rounded">
                                    <p className="font-semibold text-green-600">+{earner.recentAchievements}</p>
                                    <p className="text-gray-600">Recent</p>
                                  </div>
                                  <div className="text-center p-2 bg-white rounded">
                                    <p className="font-semibold text-purple-600">{earner.tierProgression.length}</p>
                                    <p className="text-gray-600">Tiers Earned</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Badge Distribution Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Badge Tier Distribution</h3>
                      <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                      {analyticsData.badgeStats.tierDistribution.map((tier) => {
                        const TierIcon = getTierIcon(tier.tier);
                        const tierColor = getTierColor(tier.tier);
                        
                        return (
                          <div key={tier.tier} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TierIcon className={`h-5 w-5 ${tierColor} mr-3`} />
                              <span className="text-sm text-gray-600">{tier.tier}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" 
                                  style={{ width: `${tier.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8">{tier.count}</span>
                              <span className="text-xs text-green-600 w-12">+{tier.growth}%</span>
                              <span className="text-xs text-blue-600 w-16">+{tier.monthlyGrowth}%/mo</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Badge Category Breakdown */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Badge Categories Performance</h3>
                      <Target className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                      {analyticsData.badgeStats.categoryBreakdown.map((category, index) => (
                        <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{category.name}</h4>
                            <span className="text-sm font-semibold text-blue-600">{category.count} badges</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span>Avg time to earn: {category.averageTime} months</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-gray-500">Top earners:</span>
                            {category.topEarners.slice(0, 3).map((earner, earnerIndex) => (
                              <span key={earnerIndex} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {earner}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Milestone Achievements */}
            {badgeAnalyticsView === 'milestones' && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Milestone Achievements</h3>
                    <Target className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {analyticsData.badgeStats.recentMilestones.map((milestone, index) => {
                      const TierIcon = getTierIcon(BADGE_TIERS.find(t => t.level === milestone.tierLevel)?.name || 'Bronze');
                      
                      return (
                        <div key={index} className="flex items-start p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                          <div className="p-3 bg-green-100 rounded-full mr-4">
                            <TierIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{milestone.userName}</h4>
                              <span className="text-sm text-gray-500">{new Date(milestone.achievedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-lg text-gray-800 mb-2">{milestone.milestone}</p>
                            <div className="flex items-center space-x-4">
                              <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                                {milestone.category}
                              </span>
                              <span className="inline-block px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full">
                                Tier Level {milestone.tierLevel}
                              </span>
                              <span className="text-sm text-green-700 font-medium">
                                Impact: {milestone.impact}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Milestone Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Achievement Velocity</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Time to Advancement</span>
                        <span className="text-sm font-medium">{analyticsData.badgeStats.averageTimeToAdvancement} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Advancement Rate</span>
                        <span className="text-sm font-medium text-green-600">{analyticsData.badgeStats.tierAdvancementRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Recent Milestones</span>
                        <span className="text-sm font-medium text-blue-600">{analyticsData.badgeStats.recentMilestones.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-900 mb-4">User Retention by Tier</h4>
                    <div className="space-y-3">
                      {analyticsData.badgeStats.retentionByTier.slice(0, 4).map((retention) => (
                        <div key={retention.tier} className="flex justify-between">
                          <span className="text-sm text-gray-600">{retention.tier}</span>
                          <span className="text-sm font-medium text-green-600">{retention.retentionRate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Engagement Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Badge Views/User</span>
                        <span className="text-sm font-medium">{analyticsData.badgeStats.engagementMetrics.badgeViewsPerUser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Profile Completion</span>
                        <span className="text-sm font-medium text-green-600">{analyticsData.badgeStats.engagementMetrics.profileCompletionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Achievement Shares</span>
                        <span className="text-sm font-medium text-blue-600">{analyticsData.badgeStats.engagementMetrics.achievementShareRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Badge Progression Trends */}
            {badgeAnalyticsView === 'trends' && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Badge Tier Progression Over Time</h3>
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {analyticsData.badgeStats.badgeProgression.slice(-6).map((month, index) => (
                      <div key={month.month} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-900">{month.month}</span>
                          <span className="text-xs text-gray-500">
                            Total: {month.bronze + month.silver + month.gold + month.platinum + month.diamond + month.elite + month.legendary}
                          </span>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-xs">
                          <div className="text-center">
                            <div className="w-full bg-orange-200 rounded h-2 mb-1">
                              <div className="bg-orange-500 h-2 rounded" style={{ width: '100%' }} />
                            </div>
                            <span className="text-orange-600 font-medium">{month.bronze}</span>
                            <p className="text-gray-500">Bronze</p>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-gray-200 rounded h-2 mb-1">
                              <div className="bg-gray-500 h-2 rounded" style={{ width: '100%' }} />
                            </div>
                            <span className="text-gray-600 font-medium">{month.silver}</span>
                            <p className="text-gray-500">Silver</p>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-yellow-200 rounded h-2 mb-1">
                              <div className="bg-yellow-500 h-2 rounded" style={{ width: '100%' }} />
                            </div>
                            <span className="text-yellow-600 font-medium">{month.gold}</span>
                            <p className="text-gray-500">Gold</p>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-blue-200 rounded h-2 mb-1">
                              <div className="bg-blue-500 h-2 rounded" style={{ width: '100%' }} />
                            </div>
                            <span className="text-blue-600 font-medium">{month.platinum}</span>
                            <p className="text-gray-500">Platinum</p>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-purple-200 rounded h-2 mb-1">
                              <div className="bg-purple-500 h-2 rounded" style={{ width: '100%' }} />
                            </div>
                            <span className="text-purple-600 font-medium">{month.diamond}</span>
                            <p className="text-gray-500">Diamond</p>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-indigo-200 rounded h-2 mb-1">
                              <div className="bg-indigo-500 h-2 rounded" style={{ width: '100%' }} />
                            </div>
                            <span className="text-indigo-600 font-medium">{month.elite}</span>
                            <p className="text-gray-500">Elite</p>
                          </div>
                          <div className="text-center">
                            <div className="w-full bg-pink-200 rounded h-2 mb-1">
                              <div className="bg-pink-500 h-2 rounded" style={{ width: '100%' }} />
                            </div>
                            <span className="text-pink-600 font-medium">{month.legendary}</span>
                            <p className="text-gray-500">Legendary</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Growth Analysis</h3>
                    <div className="space-y-4">
                      {analyticsData.badgeStats.tierDistribution.map((tier) => {
                        const TierIcon = getTierIcon(tier.tier);
                        const tierColor = getTierColor(tier.tier);
                        
                        return (
                          <div key={tier.tier} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <TierIcon className={`h-5 w-5 ${tierColor} mr-3`} />
                              <span className="font-medium text-gray-900">{tier.tier}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">{tier.count} users</span>
                              <span className="text-sm font-medium text-green-600">+{tier.growth}% total</span>
                              <span className="text-sm font-medium text-blue-600">+{tier.monthlyGrowth}% monthly</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Highlights</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center mb-2">
                          <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="font-medium text-yellow-900">Legendary Tier Milestone</span>
                        </div>
                        <p className="text-sm text-yellow-800">
                          First users reached Legendary tier, representing the top 1% of platform performers
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <div className="flex items-center mb-2">
                          <Diamond className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="font-medium text-purple-900">Diamond Tier Growth</span>
                        </div>
                        <p className="text-sm text-purple-800">
                          45% growth in Diamond tier users, showing strong progression in high-value freelancers
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                        <div className="flex items-center mb-2">
                          <Target className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-900">Milestone Acceleration</span>
                        </div>
                        <p className="text-sm text-green-800">
                          Average time to tier advancement decreased by 15%, indicating improved user engagement
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Analytics Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Platform Analytics</h2>
                <p className="text-gray-600">Comprehensive insights into platform performance</p>
              </div>
              <select
                value={analyticsDateRange}
                onChange={(e) => setAnalyticsDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Revenue</p>
                    <p className="text-2xl font-bold">{analyticsData.invoiceStats.totalBtc.toFixed(4)} BTC</p>
                    <p className="text-sm text-blue-100">${analyticsData.invoiceStats.totalUsd.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Task Completion</p>
                    <p className="text-2xl font-bold">{analyticsData.taskStats.completionRate}%</p>
                    <p className="text-sm text-green-100">{analyticsData.taskStats.completed} completed</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Active Users</p>
                    <p className="text-2xl font-bold">{analyticsData.userStats.activeUsers}</p>
                    <p className="text-sm text-purple-100">+{analyticsData.userStats.userGrowthRate}% growth</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Storage Used</p>
                    <p className="text-2xl font-bold">{analyticsData.fileStats.totalStorage} GB</p>
                    <p className="text-sm text-orange-100">{analyticsData.fileStats.totalFiles} files</p>
                  </div>
                  <HardDrive className="h-8 w-8 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Invoice Trends Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Invoice Trends</h3>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {analyticsData.invoiceStats.monthlyTrend.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(month.count / 35) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{month.count}</span>
                        <span className="text-sm text-gray-600 w-16">{month.amount} BTC</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Status Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
                  <PieChart className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{analyticsData.invoiceStats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Paid</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{analyticsData.invoiceStats.paid}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Distributed</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{analyticsData.invoiceStats.distributed}</span>
                  </div>
                </div>
              </div>

              {/* Badge Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Popular Badges</h3>
                  <Award className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {analyticsData.badgeStats.mostCommonBadges.map((badge, index) => (
                    <div key={badge.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{badge.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${(badge.count / 25) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-6">{badge.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Type Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">File Types</h3>
                  <File className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {analyticsData.fileStats.fileTypeDistribution.map((fileType, index) => (
                    <div key={fileType.type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{fileType.type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(fileType.count / 50) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-6">{fileType.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">Team Collaboration</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Team Invoices</span>
                    <span className="text-sm font-medium">{analyticsData.paymentStats.teamInvoices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Solo Invoices</span>
                    <span className="text-sm font-medium">{analyticsData.paymentStats.soloInvoices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Team Size</span>
                    <span className="text-sm font-medium">{analyticsData.paymentStats.avgTeamSize}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">User Engagement</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Badges/User</span>
                    <span className="text-sm font-medium">{analyticsData.badgeStats.avgBadgesPerUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Task Time</span>
                    <span className="text-sm font-medium">{analyticsData.taskStats.avgTimeSpent}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New Users</span>
                    <span className="text-sm font-medium">+{analyticsData.userStats.newUsersThisMonth}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-4">Storage Analytics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg File Size</span>
                    <span className="text-sm font-medium">{analyticsData.fileStats.avgFileSize} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Storage</span>
                    <span className="text-sm font-medium">{analyticsData.fileStats.totalStorage} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Files/User</span>
                    <span className="text-sm font-medium">{(analyticsData.fileStats.totalFiles / analyticsData.userStats.totalUsers).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Users</h3>
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>User management functionality will be implemented here</p>
              <p className="text-sm">This requires additional backend endpoints to list all users</p>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All Platform Invoices</h3>
                <button
                  onClick={() => setShowAddForm({ type: 'invoice' })}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Invoice
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6">
              {showAddForm.type === 'invoice' && (
                <form onSubmit={handleAddItem} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Add New Invoice</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Invoice ID"
                      value={newItemData.id}
                      onChange={(e) => setNewItemData({ ...newItemData, id: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Invoice details"
                      value={newItemData.value}
                      onChange={(e) => setNewItemData({ ...newItemData, value: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      type="submit"
                      disabled={addInvoiceMutation.isPending}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {addInvoiceMutation.isPending ? 'Adding...' : 'Add Invoice'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm({ type: null })}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {loadingInvoices ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No invoices found</p>
                  <p className="text-sm">This feature requires backend implementation to list all user invoices</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredInvoices.map((userInvoices) => (
                    <div key={userInvoices.user} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        User: {userInvoices.user.slice(0, 8)}...{userInvoices.user.slice(-6)}
                      </h4>
                      <div className="space-y-2">
                        {userInvoices.invoices.map(([id, invoice]) => (
                          <div key={id.toString()} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              {editingItem?.type === 'invoice' && editingItem.userId === userInvoices.user && editingItem.id === id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="flex-1 input-field"
                                  />
                                  <button
                                    onClick={handleSaveEdit}
                                    disabled={updateInvoiceMutation.isPending}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className="font-medium text-gray-900">Invoice #{id.toString()}</p>
                                  <p className="text-sm text-gray-600">{invoice.details}</p>
                                  {invoice.files.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {invoice.files.length} file{invoice.files.length !== 1 ? 's' : ''} attached
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                            {(!editingItem || editingItem.type !== 'invoice' || editingItem.userId !== userInvoices.user || editingItem.id !== id) && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit('invoice', userInvoices.user, id, invoice.details)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('invoice', userInvoices.user, id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All Platform Tasks</h3>
                <button
                  onClick={() => setShowAddForm({ type: 'task' })}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6">
              {showAddForm.type === 'task' && (
                <form onSubmit={handleAddItem} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Add New Task</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Task ID"
                      value={newItemData.id}
                      onChange={(e) => setNewItemData({ ...newItemData, id: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Task description"
                      value={newItemData.value}
                      onChange={(e) => setNewItemData({ ...newItemData, value: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      type="submit"
                      disabled={addTaskMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {addTaskMutation.isPending ? 'Adding...' : 'Add Task'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm({ type: null })}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {loadingTasks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No tasks found</p>
                  <p className="text-sm">This feature requires backend implementation to list all user tasks</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredTasks.map((userTasks) => (
                    <div key={userTasks.user} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        User: {userTasks.user.slice(0, 8)}...{userTasks.user.slice(-6)}
                      </h4>
                      <div className="space-y-2">
                        {userTasks.tasks.map(([id, description]) => (
                          <div key={id.toString()} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              {editingItem?.type === 'task' && editingItem.userId === userTasks.user && editingItem.id === id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="flex-1 input-field"
                                  />
                                  <button
                                    onClick={handleSaveEdit}
                                    disabled={updateTaskMutation.isPending}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <p className="font-medium text-gray-900">Task #{id.toString()}</p>
                                  <p className="text-sm text-gray-600">{description}</p>
                                </>
                              )}
                            </div>
                            {(!editingItem || editingItem.type !== 'task' || editingItem.userId !== userTasks.user || editingItem.id !== id) && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit('task', userTasks.user, id, description)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('task', userTasks.user, id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Platform Badges</h3>
            {loadingBadges ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              </div>
            ) : allBadges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No badges found</p>
                <p className="text-sm">This feature requires backend implementation to list all user badges</p>
              </div>
            ) : (
              <div className="space-y-6">
                {allBadges.map((userBadges) => (
                  <div key={userBadges.user} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      User: {userBadges.user.slice(0, 8)}...{userBadges.user.slice(-6)}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userBadges.badges.map(([name, description]) => (
                        <div key={name} className="p-3 bg-gray-50 rounded">
                          <p className="font-medium text-gray-900">{name}</p>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All Platform Files</h3>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6">
              {loadingFiles ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <File className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No files found</p>
                  <p className="text-sm">This feature requires backend implementation to list all user files</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredFiles.map((userFiles) => (
                    <div key={userFiles.user} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        User: {userFiles.user.slice(0, 8)}...{userFiles.user.slice(-6)}
                      </h4>
                      <div className="space-y-2">
                        {userFiles.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center flex-1">
                              <span className="text-2xl mr-3">{getFileIcon(file.mimeType)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {file.name || file.path.split('/').pop() || 'Unknown'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                  <div className="flex items-center">
                                    <HardDrive className="h-3 w-3 mr-1" />
                                    {formatFileSize(file.size)}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(file.uploadedAt)}
                                  </div>
                                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">
                                    {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              <button
                                onClick={() => handleFileView(file)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="View/Download file"
                              >
                                {file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf' ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </button>
                              {file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf' ? (
                                <button
                                  onClick={() => handleFileDownload(file)}
                                  className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                  title="Download file"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
