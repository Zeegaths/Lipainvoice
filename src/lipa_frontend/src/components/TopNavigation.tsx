import { useInternetIdentity } from 'ic-use-internet-identity';
import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

interface TopNavigationProps {
  onMenuClick: () => void;
  onSettingsClick: () => void;
  onNotificationsClick: () => void;
}

const TopNavigation = ({ onMenuClick, onSettingsClick, onNotificationsClick }: TopNavigationProps) => {
  const { clear, identity } = useInternetIdentity();
  const data: any[] = [];
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await clear();
  };

  const userPrincipal = identity?.getPrincipal().toString();
  const shortPrincipal = userPrincipal ? `${userPrincipal.slice(0, 5)}...${userPrincipal.slice(-3)}` : '';
  
  const unreadCount = data.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200 transform hover:scale-110"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden lg:flex items-center ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            onClick={onNotificationsClick}
            className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">Freelancer</p>
                <p className="text-xs text-gray-500">{shortPrincipal}</p>
              </div>
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                <User className="h-4 w-4 text-white" />
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-300 animate-scale-in">
                <button
                  onClick={() => {
                    onSettingsClick();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
