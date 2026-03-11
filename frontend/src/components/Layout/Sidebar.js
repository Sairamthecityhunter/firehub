import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Compass,
  Upload,
  User,
  Heart,
  DollarSign,
  Settings,
  Shield,
  BarChart3,
  Users,
  Video,
  Bookmark
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Explore',
      href: '/explore',
      icon: Compass,
      current: location.pathname === '/explore',
    },
    {
      name: 'Upload Video',
      href: '/dashboard/upload',
      icon: Upload,
      current: location.pathname === '/dashboard/upload',
      creatorOnly: true,
    },
    {
      name: 'My Videos',
      href: '/dashboard/videos',
      icon: Video,
      current: location.pathname === '/dashboard/videos',
      creatorOnly: true,
    },
    {
      name: 'Subscriptions',
      href: '/dashboard/subscriptions',
      icon: Heart,
      current: location.pathname === '/dashboard/subscriptions',
    },
    {
      name: 'Earnings',
      href: '/dashboard/earnings',
      icon: DollarSign,
      current: location.pathname === '/dashboard/earnings',
      creatorOnly: true,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      current: location.pathname === '/dashboard/analytics',
      creatorOnly: true,
    },
    {
      name: 'Subscribers',
      href: '/dashboard/subscribers',
      icon: Users,
      current: location.pathname === '/dashboard/subscribers',
      creatorOnly: true,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
      current: location.pathname === '/dashboard/profile',
    },
    {
      name: 'Verification',
      href: '/dashboard/verification',
      icon: Shield,
      current: location.pathname === '/dashboard/verification',
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      current: location.pathname === '/dashboard/settings',
    },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.creatorOnly && !user?.is_creator) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
      <div className="flex flex-col h-full">
        {/* User info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.display_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.display_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.display_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.is_creator ? 'Creator' : 'Viewer'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    item.current
                      ? 'text-primary-500 dark:text-primary-400'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick stats for creators */}
        {user?.is_creator && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Videos</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user?.creator_profile?.total_videos || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subscribers</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user?.creator_profile?.total_subscribers || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Earnings</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ${user?.total_earnings || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 