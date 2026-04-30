import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const getApiUrl = (endpoint) => {
    const role = user?.role || 'employee';
    return `http://localhost:5000/api/v1/${role}${endpoint}`;
  };

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/notifications'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let notificationsData = [];
        
        if (Array.isArray(data)) {
          notificationsData = data;
        } else if (data.data && Array.isArray(data.data)) {
          notificationsData = data.data;
        } else if (data.notifications && Array.isArray(data.notifications)) {
          notificationsData = data.notifications;
        }
        
        notificationsData = notificationsData.map(n => ({
          ...n,
          priority: n.priority || 'low' 
        }));
        
        setNotifications(notificationsData);
        const unread = notificationsData.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } else {
        console.error('Failed to fetch notifications');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/notifications/unread/count'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || data.data?.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/notifications/${notificationId}/read`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/notifications/read-all'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/notifications/${notificationId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

  const clearAll = async () => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/notifications/clear-all'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    setNotifications,
    setUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};