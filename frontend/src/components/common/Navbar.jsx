import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  BellIcon, 
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CheckIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  BellAlertIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/solid';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <button
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
      className={`relative w-14 h-7 rounded-full transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 text-[13px] transition-opacity duration-300 select-none
        ${darkMode ? 'opacity-100' : 'opacity-0'}`}>🌙</span>
      <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[13px] transition-opacity duration-300 select-none
        ${darkMode ? 'opacity-0' : 'opacity-100'}`}>☀️</span>
      <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500
        ease-[cubic-bezier(.34,1.56,.64,1)] ${darkMode ? 'left-7' : 'left-0.5'}`}
      />
    </button>
  );
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserAvatar = ({ user, darkMode }) => {
  const [imgError, setImgError] = useState(false);
  const profilePicUrl = user?.profile_picture && !imgError
    ? `${BASE_URL}${user.profile_picture}`
    : null;

  return (
    <div className="relative">
      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
        {profilePicUrl ? (
          <img src={profilePicUrl} alt={user?.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <span className="text-white font-semibold text-sm select-none">
            {user?.name?.charAt(0)?.toUpperCase()}
          </span>
        )}
      </div>
      <span className="absolute -bottom-1 -right-1 px-1 py-0.5 text-xs font-bold rounded"
        style={{
          background: user?.role === 'admin' ? '#7c3aed' : user?.role === 'hr' ? '#2563eb' : '#059669',
          color: '#fff',
          fontSize: '9px',
          lineHeight: '1.2'
        }}>
        {user?.role === 'admin' ? 'Admin' : user?.role === 'hr' ? 'HR' : 'Emp'}
      </span>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch (error) { console.error('Logout failed:', error); }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'hr':    return '/hr/dashboard';
      default:      return '/employee/dashboard';
    }
  };

  const getNavigationLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard',     path: '/admin/dashboard' },
          { name: 'HR Management', path: '/admin/hr' },
          { name: 'Templates',     path: '/admin/templates' },
          { name: 'Analytics',     path: '/admin/analytics' },
        ];
      case 'hr':
        return [
          { name: 'Dashboard', path: '/hr/dashboard' },
          { name: 'Templates', path: '/hr/templates' },
          { name: 'Employees', path: '/hr/employees' },
          { name: 'Analytics', path: '/hr/analytics' },
        ];
      default:
        return [
          { name: 'Dashboard', path: '/employee/dashboard' },
          { name: 'My Tasks',  path: '/employee/tasks' },
          { name: 'Documents', path: '/employee/documents' },
          { name: 'Handbook',  path: '/employee/handbook' },
        ];
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Administrator';
      case 'hr':    return 'HR Manager';
      default:      return 'Employee';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':         return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'reminder':     return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case 'system':       return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
      case 'announcement': return <BellAlertIcon className="h-5 w-5 text-purple-500" />;
      default:             return <BellIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours   = Math.floor(diff / 3600000);
    const days    = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24)   return `${hours}h ago`;
    if (days < 7)     return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) markAsRead(notification.id);
    if (notification.link) { navigate(notification.link); setShowNotifications(false); }
  };

  const handleViewAllNotifications = () => {
    const notificationPath = user?.role === 'employee' ? '/employee/notifications' : `/${user?.role}/notifications`;
    navigate(notificationPath);
    setShowNotifications(false);
  };

  const getProfilePath = () => {
    if (!user) return '/login';
    return user.role === 'employee' ? '/employee/profile' : `/${user.role}/settings`;
  };

  const getSettingsPath = () => {
    if (!user) return '/login';
    return `/${user.role}/settings`;
  };

  const recentNotifications = notifications.slice(0, 5);
  const navigationLinks = getNavigationLinks();

  const navBg = darkMode ? '#0f172a' : '#ffffff';
  const navBorder = darkMode ? '#1e293b' : '#f1f5f9';
  const textPrimary = darkMode ? '#f8fafc' : '#0f172a';
  const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const hoverBg = darkMode ? 'rgba(255,255,255,0.06)' : '#f8fafc';
  const dropdownBg = darkMode ? '#1e293b' : '#ffffff';
  const dropdownBorder = darkMode ? '#334155' : '#e2e8f0';

  return (
    <nav className="sticky top-0 z-20 w-full"
      style={{ background: navBg, borderBottom: `1px solid ${navBorder}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="w-full px-5">
        <div className="flex justify-between items-center h-14">

          <Link to={getDashboardLink()} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#2563eb' }}>
              O
            </div>
            <span className="text-base font-bold" style={{ color: textPrimary }}>OnboardPro</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center mx-8">
              {navigationLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                    style={{
                      background: isActive ? '#2563eb' : 'transparent',
                      color: isActive ? '#fff' : textMuted,
                      fontWeight: isActive ? '600' : '500',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hoverBg; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />

            {user ? (
              <>
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg transition-colors"
                    style={{ color: textMuted }}
                    onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <BellIcon className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-red-500 text-white text-xs font-bold rounded-full" style={{ fontSize: '10px' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 rounded-xl shadow-xl z-30 max-h-[480px] overflow-hidden flex flex-col"
                      style={{ background: dropdownBg, border: `1px solid ${dropdownBorder}` }}>
                      <div className="px-4 py-3 flex items-center justify-between"
                        style={{ borderBottom: `1px solid ${dropdownBorder}` }}>
                        <div>
                          <h3 className="text-sm font-bold" style={{ color: textPrimary }}>Notifications</h3>
                          <p className="text-xs" style={{ color: textMuted }}>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
                        </div>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs font-medium flex items-center gap-1" style={{ color: '#2563eb' }}>
                            <CheckIcon className="h-3.5 w-3.5" /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-1">
                        {recentNotifications.length === 0 ? (
                          <div className="px-4 py-10 text-center">
                            <BellIcon className="h-10 w-10 mx-auto mb-2" style={{ color: '#cbd5e1' }} />
                            <p className="text-sm" style={{ color: textMuted }}>No notifications</p>
                          </div>
                        ) : (
                          <div>
                            {recentNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                className="px-4 py-3 cursor-pointer transition-colors"
                                style={{
                                  background: !notification.is_read ? (darkMode ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.04)') : 'transparent',
                                  borderBottom: `1px solid ${dropdownBorder}`
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                                onMouseLeave={e => e.currentTarget.style.background = !notification.is_read ? (darkMode ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.04)') : 'transparent'}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex gap-3">
                                  <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <p className="text-sm font-semibold" style={{ color: textPrimary }}>{notification.title}</p>
                                          {!notification.is_read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#2563eb' }}></span>}
                                        </div>
                                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: textMuted }}>{notification.message}</p>
                                        <p className="text-xs mt-1" style={{ color: darkMode ? '#475569' : '#94a3b8' }}>{formatTimestamp(notification.created_at)}</p>
                                      </div>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                        className="p-1 rounded transition-colors"
                                        style={{ color: '#94a3b8' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; }}
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {recentNotifications.length > 0 && (
                        <div className="px-4 py-3" style={{ borderTop: `1px solid ${dropdownBorder}` }}>
                          <button onClick={handleViewAllNotifications} className="w-full text-sm font-medium text-center" style={{ color: '#2563eb' }}>
                            View all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-semibold leading-tight" style={{ color: textPrimary }}>{user.name}</p>
                      <p className="text-xs leading-tight" style={{ color: textMuted }}>{user.email}</p>
                    </div>
                    <UserAvatar user={user} darkMode={darkMode} />
                    <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-200" style={{ color: textMuted, transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-60 rounded-xl shadow-xl py-2 z-20"
                      style={{ background: dropdownBg, border: `1px solid ${dropdownBorder}` }}>
                      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${dropdownBorder}` }}>
                        <p className="text-sm font-semibold" style={{ color: textPrimary }}>{user.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: textMuted }}>{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded"
                          style={{
                            background: user?.role === 'admin' ? '#f5f3ff' : user?.role === 'hr' ? '#eff6ff' : '#f0fdf4',
                            color: user?.role === 'admin' ? '#7c3aed' : user?.role === 'hr' ? '#2563eb' : '#059669',
                          }}>
                          {getRoleLabel()}
                        </span>
                      </div>

                      <div className="py-1">
                        {user.role === 'employee' && (
                          <Link to="/employee/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                            style={{ color: textMuted }}
                            onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            onClick={() => setShowUserMenu(false)}>
                            <UserCircleIcon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                            <span>My Profile</span>
                          </Link>
                        )}
                        {(user.role === 'hr' || user.role === 'admin') && (
                          <Link to={getSettingsPath()}
                            className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                            style={{ color: textMuted }}
                            onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            onClick={() => setShowUserMenu(false)}>
                            <Cog6ToothIcon style={{ width: 18, height: 18 }} />
                            <span>Settings</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1" style={{ borderTop: `1px solid ${dropdownBorder}` }}>
                        <button
                          onClick={() => { setShowUserMenu(false); handleLogout(); }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors"
                          style={{ color: '#ef4444' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors" style={{ color: textMuted }}>Login</Link>
                <Link to="/register" className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg" style={{ background: '#2563eb' }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {user && (
        <div className="md:hidden" style={{ borderTop: `1px solid ${navBorder}`, background: navBg }}>
          <div className="px-4 py-2 space-y-0.5">
            {navigationLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.name} to={link.path}
                  className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: isActive ? '#2563eb' : 'transparent', color: isActive ? '#fff' : textMuted }}>
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;