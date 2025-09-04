import { X, Home, Settings, LogOut, Shield, Plus, Wallet } from 'lucide-react';
import { useAuth } from '@nfid/identitykit/react';
import { Page } from '../App';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface NavigationItem {
  name: string;
  icon: any;
  page?: Page;
  href?: string;
  current: boolean;
  hasPage: boolean;
}

const Sidebar = ({ isOpen, onClose, currentPage, onNavigate }: SidebarProps) => {
  const { disconnect } = useAuth();

  const handleLogout = async () => {
    await disconnect();
    onNavigate('landing');
  };

  const handleNavigation = (page: Page) => {
    onNavigate(page);
    onClose(); // Close sidebar on mobile after navigation
  };

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', icon: Home, page: 'dashboard', current: currentPage === 'dashboard', hasPage: true },
    { name: 'Create Invoice', icon: Plus, page: 'create-invoice', current: currentPage === 'create-invoice', hasPage: true },
    { name: "My Wallet", icon: Wallet, page: 'my-wallet', current: currentPage === 'my-wallet', hasPage: true },
    { name: 'Settings', icon: Settings, page: 'settings', current: currentPage === 'settings', hasPage: true },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300"
            onClick={onClose}
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">LipaInvoice</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200 transform hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                {!item.hasPage ? (
                  <a
                    href={item.href}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105
                      ${item.current
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                ) : (
                  <button
                    onClick={() => item.page && handleNavigation(item.page)}
                    className={`
                      w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105
                      ${item.current
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 transform hover:scale-105 hover:shadow-sm"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
