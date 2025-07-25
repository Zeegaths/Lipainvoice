import { useInternetIdentity } from 'ic-use-internet-identity';
import { useState } from 'react';
import { Award, Plus, Star, Trophy, Shield, Crown, Diamond, Medal, Target, TrendingUp, Zap, Flame, Gem, Sparkles, ChevronRight, Info, X } from 'lucide-react';
import { useBadges, useAddBadge } from '../hooks/useQueries';

interface BadgeTier {
  name: string;
  level: number;
  color: string;
  bgColor: string;
  icon: any;
  criteria: {
    minRating?: number;
    minEarnings?: number;
    minProjects?: number;
    minReviews?: number;
    minMonthsActive?: number;
    specialRequirements?: string[];
  };
  benefits: string[];
  nextTierBonus?: string;
}

interface CustomBadgeCategory {
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface BadgeData {
  description: string;
  category: string;
  earnedAt?: string;
}

const BADGE_TIERS: BadgeTier[] = [
  {
    name: 'Bronze',
    level: 1,
    color: 'text-orange-700',
    bgColor: 'bg-gradient-to-r from-orange-50 to-orange-100',
    icon: Medal,
    criteria: { minRating: 3.0, minEarnings: 0.001, minProjects: 1, minReviews: 1, minMonthsActive: 1 },
    benefits: ['Basic profile visibility', 'Client review system access'],
    nextTierBonus: 'Unlock enhanced profile features'
  },
  {
    name: 'Silver',
    level: 2,
    color: 'text-gray-700',
    bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
    icon: Award,
    criteria: { minRating: 3.5, minEarnings: 0.01, minProjects: 5, minReviews: 5, minMonthsActive: 2 },
    benefits: ['Enhanced profile visibility', 'Priority in search results', 'Basic analytics access'],
    nextTierBonus: 'Unlock premium project bidding'
  },
  {
    name: 'Gold',
    level: 3,
    color: 'text-yellow-700',
    bgColor: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
    icon: Trophy,
    criteria: { minRating: 4.0, minEarnings: 0.1, minProjects: 15, minReviews: 15, minMonthsActive: 4 },
    benefits: ['Premium profile features', 'Advanced analytics', 'Client testimonial highlights', 'Reduced platform fees'],
    nextTierBonus: 'Unlock exclusive project opportunities'
  },
  {
    name: 'Platinum',
    level: 4,
    color: 'text-blue-700',
    bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100',
    icon: Shield,
    criteria: { minRating: 4.5, minEarnings: 0.5, minProjects: 50, minReviews: 50, minMonthsActive: 8 },
    benefits: ['VIP profile badge', 'Priority customer support', 'Exclusive networking events', 'Advanced project matching'],
    nextTierBonus: 'Unlock Diamond tier exclusive benefits'
  },
  {
    name: 'Diamond',
    level: 5,
    color: 'text-purple-700',
    bgColor: 'bg-gradient-to-r from-purple-50 to-purple-100',
    icon: Diamond,
    criteria: { minRating: 4.8, minEarnings: 2.0, minProjects: 100, minReviews: 100, minMonthsActive: 12 },
    benefits: ['Diamond profile distinction', 'Personal account manager', 'Beta feature access', 'Revenue sharing program'],
    nextTierBonus: 'Unlock Elite tier legendary status'
  },
  {
    name: 'Elite',
    level: 6,
    color: 'text-indigo-700',
    bgColor: 'bg-gradient-to-r from-indigo-50 to-indigo-100',
    icon: Crown,
    criteria: { minRating: 4.9, minEarnings: 10.0, minProjects: 500, minReviews: 500, minMonthsActive: 24 },
    benefits: ['Legendary status badge', 'Platform partnership opportunities', 'Speaking engagement invites'],
    nextTierBonus: 'Hall of Fame induction'
  }
];

const CUSTOM_BADGE_CATEGORIES: CustomBadgeCategory[] = [
  { name: 'Technical Excellence', description: 'Outstanding technical skills', icon: Zap, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: 'Client Relations', description: 'Exceptional client satisfaction', icon: Star, color: 'text-green-600', bgColor: 'bg-green-50' },
  { name: 'Innovation', description: 'Creative solutions', icon: Flame, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { name: 'Leadership', description: 'Team leadership excellence', icon: Crown, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { name: 'Specialization', description: 'Deep domain expertise', icon: Gem, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { name: 'Community', description: 'Community contributions', icon: Trophy, color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
];

const BadgesSection = () => {
  const { identity } = useInternetIdentity();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTierInfo, setShowTierInfo] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newBadge, setNewBadge] = useState({ name: '', description: '', category: 'Technical Excellence' });
  
  const { data: badges = [], isLoading } = useBadges();
  const addBadgeMutation = useAddBadge();

  // Mock user stats
  const userStats = {
    averageRating: 4.6,
    totalEarnings: 0.75,
    completedProjects: 32,
    totalReviews: 28,
    monthsActive: 8,
    repeatClients: 5,
    disputeRate: 0,
    deliveryRate: 97,
    responseTime: 2.5,
    categoryRanking: 15,
    menteeCount: 2,
    communityScore: 85
  };

  const getCurrentTier = () => {
    for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
      const tier = BADGE_TIERS[i];
      const meetsRating = userStats.averageRating >= (tier.criteria.minRating || 0);
      const meetsEarnings = userStats.totalEarnings >= (tier.criteria.minEarnings || 0);
      const meetsProjects = userStats.completedProjects >= (tier.criteria.minProjects || 0);
      const meetsReviews = userStats.totalReviews >= (tier.criteria.minReviews || 0);
      const meetsMonths = userStats.monthsActive >= (tier.criteria.minMonthsActive || 0);
      
      if (meetsRating && meetsEarnings && meetsProjects && meetsReviews && meetsMonths) {
        return tier;
      }
    }
    return BADGE_TIERS[0];
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    const nextTierIndex = BADGE_TIERS.findIndex(tier => tier.level > currentTier.level);
    return nextTierIndex !== -1 ? BADGE_TIERS[nextTierIndex] : null;
  };

  const getProgressToNextTier = () => {
    const nextTier = getNextTier();
    if (!nextTier) return 100;

    const progressMetrics = [
      { current: userStats.averageRating, required: nextTier.criteria.minRating || 0, weight: 0.25 },
      { current: userStats.totalEarnings, required: nextTier.criteria.minEarnings || 0, weight: 0.25 },
      { current: userStats.completedProjects, required: nextTier.criteria.minProjects || 0, weight: 0.25 },
      { current: userStats.monthsActive, required: nextTier.criteria.minMonthsActive || 0, weight: 0.25 }
    ];

    const totalProgress = progressMetrics.reduce((sum, metric) => {
      const progress = Math.min(metric.current / metric.required, 1);
      return sum + (progress * metric.weight);
    }, 0);

    return totalProgress * 100;
  };

  const getDetailedProgress = () => {
    const nextTier = getNextTier();
    if (!nextTier) return [];

    return [
      {
        name: 'Rating',
        current: userStats.averageRating,
        required: nextTier.criteria.minRating || 0,
        progress: Math.min((userStats.averageRating / (nextTier.criteria.minRating || 1)) * 100, 100),
        unit: '★'
      },
      {
        name: 'Earnings',
        current: userStats.totalEarnings,
        required: nextTier.criteria.minEarnings || 0,
        progress: Math.min((userStats.totalEarnings / (nextTier.criteria.minEarnings || 1)) * 100, 100),
        unit:''
      },
      {
        name: 'Projects',
        current: userStats.completedProjects,
        required: nextTier.criteria.minProjects || 0,
        progress: Math.min((userStats.completedProjects / (nextTier.criteria.minProjects || 1)) * 100, 100),
        unit: ''
      },
      {
        name: 'Experience',
        current: userStats.monthsActive,
        required: nextTier.criteria.minMonthsActive || 0,
        progress: Math.min((userStats.monthsActive / (nextTier.criteria.minMonthsActive || 1)) * 100, 100),
        unit: 'mo'
      }
    ];
  };

  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBadge.name && newBadge.description) {
      const badgeData = {
        ...newBadge,
        category: newBadge.category,
        earnedAt: new Date().toISOString()
      };
      
      await addBadgeMutation.mutateAsync({
        name: newBadge.name,
        description: JSON.stringify(badgeData)
      });
      setNewBadge({ name: '', description: '', category: 'Technical Excellence' });
      setShowAddForm(false);
    }
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressPercentage = getProgressToNextTier();
  const detailedProgress = getDetailedProgress();

  const filteredBadges = badges.filter(([name, description]) => {
    if (selectedCategory === 'all') return true;
    try {
      const parsed = JSON.parse(description);
      return parsed.category === selectedCategory;
    } catch {
      return selectedCategory === 'all';
    }
  });

  if (!identity) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Reputation & Achievements</h3>
          <p className="text-gray-500">Please log in to view your reputation and earned badges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${currentTier.bgColor}`}>
              <currentTier.icon className={`h-6 w-6 ${currentTier.color}`} />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-900">Reputation & Achievements</h2>
              <div className="flex items-center space-x-2">
                <span className={`font-semibold ${currentTier.color}`}>{currentTier.name} Tier</span>
                {nextTier && (
                  <>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">{nextTier.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">           
            <button
              onClick={() => setShowTierInfo(!showTierInfo)}
              className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-xl font-medium transition-all duration-200"
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Tiers</span>
            </button>        
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Current Status - More Compact */}
        <div className="mb-6">
          <div className={`${currentTier.bgColor} rounded-xl p-4 border border-gray-200`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <currentTier.icon className={`h-8 w-8 ${currentTier.color} mr-3`} />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{currentTier.name} Freelancer</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center text-yellow-500 mr-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-3 w-3 ${star <= Math.floor(userStats.averageRating) ? 'fill-current' : ''}`} 
                        />
                      ))}
                      <span className="ml-1 text-sm font-semibold text-gray-900">
                        {userStats.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      {userStats.totalReviews} reviews • {userStats.completedProjects} projects
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                  <p className="text-lg font-bold text-purple-600">{currentTier.benefits.length}</p>
                  <p className="text-xs text-gray-600">Benefits</p>
                </div>
              </div>
            </div>

            {/* Progress to Next Tier - Compact */}
            {nextTier && (
              <div className="bg-white bg-opacity-80 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Progress to {nextTier.name}
                  </span>
                  <span className="text-sm font-bold text-purple-600">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {detailedProgress.map((metric, index) => (
                    <div key={index} className="text-center">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            metric.progress >= 100 ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.min(metric.progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-700">{metric.name}</p>
                      <p className="text-xs text-gray-600">
                        {metric.current}{metric.unit}/{metric.required}{metric.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Performance Chart */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <p className="text-xl font-bold text-blue-600">{userStats.categoryRanking}%</p>
                <p className="text-xs text-gray-600">Top Percentile</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <p className="text-xl font-bold text-green-600">{userStats.deliveryRate}%</p>
                <p className="text-xs text-gray-600">Delivery Rate</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <p className="text-xl font-bold text-purple-600">{userStats.responseTime}h</p>
                <p className="text-xs text-gray-600">Avg Response</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <p className="text-xl font-bold text-orange-600">{userStats.communityScore}</p>
                <p className="text-xs text-gray-600">Community Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Modal */}
        {showMilestones && (
          <div className="mb-8 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-green-900">Achievement Milestones</h3>
              <button
                onClick={() => setShowMilestones(false)}
                className="p-2 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Completed Milestones
                </h4>
                <div className="space-y-3">
                  {[
                    { icon: Trophy, text: "First 10 Projects Completed", date: "2 months ago" },
                    { icon: Star, text: "4.5+ Average Rating Achieved", date: "1 month ago" },
                    { icon: Diamond, text: "0.1 BTC Total Earnings", date: "3 weeks ago" }
                  ].map((milestone, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-100 rounded-xl">
                      <milestone.icon className="h-5 w-5 text-green-600 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">{milestone.text}</p>
                        <p className="text-xs text-green-600">{milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Upcoming Milestones
                </h4>
                <div className="space-y-3">
                  {[
                    { icon: Target, text: "50 Projects Milestone", progress: "18 to go" },
                    { icon: Crown, text: "First Repeat Client", progress: "5 achieved" },
                    { icon: Flame, text: "1 Year Active Milestone", progress: "4 months to go" }
                  ].map((milestone, index) => (
                    <div key={index} className="flex items-center p-3 bg-blue-100 rounded-xl">
                      <milestone.icon className="h-5 w-5 text-blue-600 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">{milestone.text}</p>
                        <p className="text-xs text-blue-600">{milestone.progress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tier Information Modal */}
        {showTierInfo && (
          <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-blue-900">Badge Tier System</h3>
              <button
                onClick={() => setShowTierInfo(false)}
                className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {BADGE_TIERS.map((tier) => {
                const IconComponent = tier.icon;
                const isCurrentTier = tier.level === currentTier.level;
                const isAchieved = tier.level <= currentTier.level;
                
                return (
                  <div 
                    key={tier.name}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isCurrentTier 
                        ? 'border-purple-400 bg-purple-100 shadow-lg' 
                        : isAchieved 
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <IconComponent className={`h-6 w-6 ${tier.color} mr-2`} />
                      <div>
                        <span className="font-bold text-gray-900">{tier.name}</span>
                        {isCurrentTier && (
                          <span className="ml-2 px-2 py-1 text-xs bg-purple-600 text-white rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <p className="font-semibold text-gray-800">Requirements:</p>
                      <p>• Rating: {tier.criteria.minRating}+ stars</p>
                      <p>• Earnings: {tier.criteria.minEarnings}+ BTC</p>
                      <p>• Projects: {tier.criteria.minProjects}+</p>
                      <p>• Experience: {tier.criteria.minMonthsActive}+ months</p>
                    </div>

                    <div className="text-xs text-green-700">
                      <p className="font-semibold text-gray-800 mb-1">Benefits:</p>
                      {tier.benefits.slice(0, 2).map((benefit, index) => (
                        <p key={index} className="text-xs">• {benefit}</p>
                      ))}
                      {tier.benefits.length > 2 && (
                        <p className="text-xs text-gray-500">+{tier.benefits.length - 2} more...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Badge Form */}
        {showAddForm && (
          <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Custom Achievement Badge</h3>
            <form onSubmit={handleAddBadge} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge Name</label>
                  <input
                    type="text"
                    placeholder="Enter badge name"
                    value={newBadge.name}
                    onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newBadge.category}
                    onChange={(e) => setNewBadge({ ...newBadge, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    {CUSTOM_BADGE_CATEGORIES.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the achievement"
                  value={newBadge.description}
                  onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={addBadgeMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {addBadgeMutation.isPending ? 'Creating...' : 'Create Badge'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Custom Badges Section */}
        <div>
          {/* Compact Badge Categories Chart */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Custom Achievement Badges</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Categories</option>
                {CUSTOM_BADGE_CATEGORIES.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Compact Category Overview Chart */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {CUSTOM_BADGE_CATEGORIES.map((category) => {
                  const categoryBadgeCount = badges.filter(([_, description]) => {
                    try {
                      const parsed = JSON.parse(description);
                      return parsed.category === category.name;
                    } catch {
                      return false;
                    }
                  }).length;

                  return (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(selectedCategory === category.name ? 'all' : category.name)}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        selectedCategory === category.name
                          ? `border-purple-300 ${category.bgColor} shadow-md`
                          : 'border-gray-200 bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto mb-1 ${
                        selectedCategory === category.name ? 'bg-white shadow-sm' : category.bgColor
                      }`}>
                        <category.icon className={`h-3 w-3 ${category.color}`} />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 truncate">{category.name.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500">{categoryBadgeCount}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Badges Display */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your badges...</p>
            </div>
          ) : filteredBadges.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedCategory === 'all' ? 'No Custom Badges Yet' : `No ${selectedCategory} Badges Yet`}
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedCategory === 'all' 
                  ? 'Create your first custom badge to showcase your achievements'
                  : `Add your first ${selectedCategory} badge to highlight your expertise`
                }
              </p>
              <button
                onClick={() => {
                  if (selectedCategory !== 'all') {
                    setNewBadge({ ...newBadge, category: selectedCategory });
                  }
                  setShowAddForm(true);
                }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Badge</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBadges.map(([name, description]) => {
                let badgeData: BadgeData;
                let category = CUSTOM_BADGE_CATEGORIES[0];
                
                try {
                  badgeData = JSON.parse(description);
                  const foundCategory = CUSTOM_BADGE_CATEGORIES.find(cat => cat.name === badgeData.category);
                  if (foundCategory) category = foundCategory;
                } catch {
                  badgeData = { description, category: 'Technical Excellence' };
                }

                const IconComponent = category.icon;

                return (
                  <div 
                    key={name} 
                    className={`${category.bgColor} rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm mr-3">
                          <IconComponent className={`h-4 w-4 ${category.color}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{name}</h4>
                          <p className="text-xs text-gray-600">{category.name}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full border ${category.color} bg-white bg-opacity-80`}>
                        <span className="text-xs font-bold">EARNED</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {badgeData.description || description}
                    </p>
                    
                    {badgeData.earnedAt && (
                      <div className="flex items-center text-xs text-gray-600 bg-white bg-opacity-60 rounded-md px-2 py-1">
                        <Trophy className="h-3 w-3 mr-1" />
                        <span>Earned {new Date(badgeData.earnedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgesSection;