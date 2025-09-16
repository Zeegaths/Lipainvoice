import { useState } from 'react';
import { X, Bell, Award, Star, DollarSign, CheckCircle, Clock, Filter } from 'lucide-react';

interface NotificationCenterProps {
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'badge_milestone' | 'achievement' | 'client_review' | 'payment' | 'progress_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

const NotificationCenter = ({ onClose }: NotificationCenterProps) => {
  // Placeholder hooks
  const useNotifications = () => ({
    data: [
      {
        id: '1',
        type: 'badge_milestone' as const,
        title: 'New Badge Achieved!',
        message: 'Congratulations! You\'ve earned the Gold tier badge.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        data: { badgeName: 'Gold', tier: 'Gold' }
      },
      {
        id: '2',
        type: 'client_review' as const,
        title: 'New Client Review',
        message: 'TechCorp left you a 5-star review with positive feedback.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        data: { rating: 5, client: 'TechCorp' }
      },
      {
        id: '3',
        type: 'payment' as const,
        title: 'Payment Received',
        message: 'Invoice #12345 has been paid. 0.05 BTC received.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        data: { amount: 0.05, invoiceId: '12345' }
      }
    ],
    isLoading: false
  });

  const useMarkNotificationRead = () => ({
    mutate: (id: string) => {
      console.log('Marking notification as read:', id);
    },
    isPending: false
  });

  const useMarkAllNotificationsRead = () => ({
    mutate: () => {
      console.log('Marking all notifications as read');
    },
    isPending: false
  });

  const { data: notifications = [], isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<'all' | 'unread' | 'badge' | 'payment'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'badge_milestone':
      case 'achievement':
        return Award;
      case 'client_review':
        return Star;
      case 'payment':
        return DollarSign;
      case 'progress_update':
        return Clock;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'badge_milestone':
      case 'achievement':
        return 'text-yellow-600 bg-yellow-100';
      case 'client_review':
        return 'text-blue-600 bg-blue-100';
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'progress_update':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'badge':
        return notification.type === 'badge_milestone';
      case 'payment':
        return notification.type === 'payment';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="badge">Badges & Achievements</option>
                <option value="payment">Payments</option>
              </select>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllReadMutation.isPending}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {filter === 'unread' ? 'All caught up!' : 'You\'ll see your notifications here'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg ${colorClasses} mr-3`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="ml-2 p-1 text-blue-600 hover:text-blue-700"
                              title="Mark as read"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredNotifications.length} notifications</span>
            <button
              onClick={onClose}
              className="text-blue-600 hover:text-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
