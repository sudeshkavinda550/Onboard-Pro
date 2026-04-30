import React, { useState } from 'react';
import { BellIcon, CheckIcon, TrashIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon, CheckCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useNotifications } from '../context/NotificationContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();
  
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); 

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return <CheckCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'reminder':
        return <ClockIcon className="h-6 w-6 text-orange-500" />;
      case 'system':
        return <InformationCircleIcon className="h-6 w-6 text-gray-500" />;
      case 'announcement':
        return <BellAlertIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-50 text-red-600 border-red-200',
      medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      low: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[priority || 'low']}`}>
        {(priority || 'low').toUpperCase()}
      </span>
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMarkAsRead = async (notificationId) => {
    const success = await markAsRead(notificationId);
    if (success) {
      toast.success('Marked as read');
    } else {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      toast.success('All notifications marked as read');
    } else {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    const success = await deleteNotification(notificationId);
    if (success) {
      toast.success('Notification deleted');
    } else {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
  if (window.confirm('Are you sure you want to delete all notifications?')) {
    const success = await clearAll();
    if (success) {
      toast.success('All notifications cleared');
    } else {
      toast.error('Failed to clear notifications');
    }
  }
};

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const isRead = notification.is_read;
    const matchesReadFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? !isRead :
      isRead;
    
    const matchesTypeFilter = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesReadFilter && matchesTypeFilter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                <BellIcon className="h-8 w-8 text-white" />
              </div>
              Notifications
            </h1>
            <p className="text-gray-600 text-lg">
              Stay updated with your latest activities and alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <CheckIcon className="h-5 w-5" />
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <TrashIcon className="h-5 w-5" />
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total</p>
                <p className="text-4xl font-bold">{notifications.length}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <BellIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-indigo-100 text-xs">📬 Updated just now</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Unread</p>
                <p className="text-4xl font-bold">{unreadCount}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <BellAlertIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-orange-100 text-xs">🔔 Awaiting attention</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Read</p>
                <p className="text-4xl font-bold">{notifications.length - unreadCount}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircleIcon className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-green-100 text-xs">✅ All caught up</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filter === 'read'
                      ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Read ({notifications.length - unreadCount})
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Filter by Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-5 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm font-medium"
              >
                <option value="all">All Types</option>
                <option value="task">Tasks</option>
                <option value="reminder">Reminders</option>
                <option value="system">System</option>
                <option value="announcement">Announcements</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 absolute top-0 left-0"></div>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mb-4">
              <BellIcon className="h-16 w-16 text-purple-600" />
            </div>
            <p className="text-gray-800 text-xl font-bold mb-2">No notifications found</p>
            <p className="text-gray-500 text-base">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const isRead = notification.is_read;
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-2xl hover:scale-[1.01] cursor-pointer ${
                    isRead
                      ? 'border-gray-100'
                      : 'border-l-8 border-l-purple-500 border-t-2 border-r-2 border-b-2 border-purple-100 bg-gradient-to-r from-purple-50/50 to-transparent'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-5">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`p-3 rounded-xl ${
                          !isRead ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg">
                                {notification.title}
                              </h3>
                              {!isRead && (
                                <span className="h-3 w-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg"></span>
                              )}
                            </div>
                            <p className="text-gray-700 text-base mb-3">
                              {notification.message}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                {formatTimestamp(notification.created_at)}
                              </span>
                              {getPriorityBadge(notification.priority)}
                              <span className="text-xs px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full font-medium border border-gray-200">
                                {notification.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 transform hover:scale-110"
                                title="Mark as read"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-110"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;