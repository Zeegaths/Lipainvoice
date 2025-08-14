import { useState } from 'react';
import { Trophy, Crown, Star, TrendingUp, Award, Medal, Zap, Target, ChevronRight, Users } from 'lucide-react';
import { useTopPerformers, useLeaderboards } from '../hooks/useQueries';

interface TopPerformer {
  userId: string;
  displayName: string;
  profilePhoto?: string;
  currentTier: string;
  totalBadges: number;
  averageRating: number;
  completedProjects: number;
  totalEarnings: number;
  specialAchievements: string[];
  position: number;
}

interface Leaderboard {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  performers: TopPerformer[];
}

const TopPerformerShowcase = () => {
  const [activeLeaderboard, setActiveLeaderboard] = useState('overall');
  const { data: topPerformers = [], isLoading } = useTopPerformers();
  const { data: leaderboards = [], isLoading: loadingLeaderboards } = useLeaderboards();

  // Mock leaderboard data - in real implementation, this would come from backend
  const mockLeaderboards: Leaderboard[] = [
    {
      id: 'overall',
      title: 'Top Performers',
      description: 'Overall platform leaders',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      performers: [
        {
          userId: '1',
          displayName: 'Alex Johnson',
          currentTier: 'Legendary',
          totalBadges: 18,
          averageRating: 4.95,
          completedProjects: 156,
          totalEarnings: 12.45,
          specialAchievements: ['Platform Pioneer', 'Innovation Award'],
          position: 1
        },
        {
          userId: '2',
          displayName: 'Sarah Chen',
          currentTier: 'Elite',
          totalBadges: 15,
          averageRating: 4.9,
          completedProjects: 142,
          totalEarnings: 8.92,
          specialAchievements: ['Technical Excellence', 'Mentor Award'],
          position: 2
        },
        {
          userId: '3',
          displayName: 'Mike Rodriguez',
          currentTier: 'Diamond',
          totalBadges: 12,
          averageRating: 4.85,
          completedProjects: 98,
          totalEarnings: 6.78,
          specialAchievements: ['Client Champion'],
          position: 3
        }
      ]
    },
    {
      id: 'ratings',
      title: 'Highest Rated',
      description: 'Best client satisfaction',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      performers: []
    },
    {
      id: 'earnings',
      title: 'Top Earners',
      description: 'Highest revenue achievers',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      performers: []
    },
    {
      id: 'rising',
      title: 'Rising Stars',
      description: 'Recent high achievers',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      performers: []
    }
  ];

  const currentLeaderboard = mockLeaderboards.find(l => l.id === activeLeaderboard) || mockLeaderboards[0];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Legendary': return 'text-white bg-pink-500 shadow-sm';
      case 'Elite': return 'text-white bg-indigo-500 shadow-sm';
      case 'Diamond': return 'text-white bg-purple-500 shadow-sm';
      case 'Platinum': return 'text-white bg-blue-500 shadow-sm';
      case 'Gold': return 'text-white bg-yellow-500 shadow-sm';
      case 'Silver': return 'text-white bg-gray-500 shadow-sm';
      default: return 'text-white bg-orange-500 shadow-sm';
    }
  };

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1: return (
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm">
          <Crown className="h-4 w-4 text-white" />
        </div>
      );
      case 2: return (
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-sm">
          <Medal className="h-4 w-4 text-white" />
        </div>
      );
      case 3: return (
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
          <Award className="h-4 w-4 text-white" />
        </div>
      );
      default: return (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-sm font-bold text-gray-700">#{position}</span>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-bold text-gray-900">Top Performers</h2>
            <p className="text-sm text-gray-600">Celebrating our platform leaders</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Leaderboard Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {mockLeaderboards.map((leaderboard) => {
            const IconComponent = leaderboard.icon;
            return (
              <button
                key={leaderboard.id}
                onClick={() => setActiveLeaderboard(leaderboard.id)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeLeaderboard === leaderboard.id
                    ? `${leaderboard.bgColor} ${leaderboard.color} border border-gray-200 shadow-sm`
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{leaderboard.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Leaderboard */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h4 className="font-bold text-gray-900 mb-2 sm:mb-0">{currentLeaderboard.title}</h4>
            <p className="text-sm text-gray-500">{currentLeaderboard.description}</p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading performers...</p>
            </div>
          ) : currentLeaderboard.performers.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No performers in this category yet</h3>
              <p className="text-gray-500 text-sm">Check back soon for updates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentLeaderboard.performers.map((performer, index) => (
                <div
                  key={performer.userId}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex flex-col space-y-3">
                    {/* Position and Profile Row */}
                    <div className="flex items-center">
                      {/* Position Badge */}
                      <div className="mr-4 flex-shrink-0">
                        {getPositionBadge(performer.position)}
                      </div>
                      
                      {/* Profile Section */}
                      <div className="flex items-center min-w-0 flex-1">
                        {performer.profilePhoto ? (
                          <img
                            src={performer.profilePhoto}
                            alt={performer.displayName}
                            className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {performer.displayName.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h5 className="font-bold text-gray-900 truncate">{performer.displayName}</h5>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getTierColor(performer.currentTier)}`}>
                              {performer.currentTier.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-current mr-1 flex-shrink-0" />
                              <span className="font-semibold">{performer.averageRating}</span>
                            </div>
                            <span className="font-medium">{performer.completedProjects} projects</span>
                            <span className="font-medium">{performer.totalBadges} badges</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Earnings & Achievements Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="text-left">
                        <p className="text-lg font-bold text-gray-900">
                          {performer.totalEarnings.toFixed(2)} BTC
                        </p>
                      </div>
                      {performer.specialAchievements.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-start sm:justify-end">
                          {performer.specialAchievements.slice(0, 2).map((achievement, achIndex) => (
                            <span
                              key={achIndex}
                              className="px-2 py-1 text-xs bg-green-500 text-white rounded-full font-medium flex-shrink-0"
                            >
                              {achievement}
                            </span>
                          ))}
                          {performer.specialAchievements.length > 2 && (
                            <span className="text-xs text-gray-500 font-medium">
                              +{performer.specialAchievements.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Special Highlights */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4">Special Highlights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-purple-900">Freelancer of the Month</h5>
                  <p className="text-sm font-semibold text-purple-700 mt-1">Alex Johnson</p>
                  <p className="text-xs text-purple-600 mt-1">Outstanding client satisfaction</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Crown className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-green-900">Rising Star</h5>
                  <p className="text-sm font-semibold text-green-700 mt-1">Emma Wilson</p>
                  <p className="text-xs text-green-600 mt-1">Fastest tier progression</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="mt-6 text-center">
          <button className="flex items-center justify-center w-full py-3 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 border border-gray-200">
            View Full Leaderboards
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopPerformerShowcase;