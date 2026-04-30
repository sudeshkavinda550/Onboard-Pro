import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  CogIcon, 
  DocumentIcon, 
  UserIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  FolderIcon,        
  ClipboardIcon,    
  ShieldCheckIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isHamburgerVisible, setIsHamburgerVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout  = () => setShowLogoutConfirm(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar  = () => { setIsSidebarOpen(false); setIsHamburgerVisible(false); };

  const employeeNav = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: HomeIcon },
    { name: 'My Tasks',  href: '/employee/tasks',     icon: DocumentTextIcon },
    { name: 'Documents', href: '/employee/documents', icon: DocumentIcon },
    { name: 'Handbook',  href: '/employee/handbook',  icon: DocumentTextIcon },
    { name: 'Profile',   href: '/employee/profile',   icon: UserIcon },
  ];

  const hrNav = [
    { name: 'Dashboard',     href: '/hr/dashboard',      icon: HomeIcon,         end: true },
    { name: 'Templates',     href: '/hr/templates',      icon: DocumentTextIcon, end: true },
    { name: 'Employees',     href: '/hr/employees',      icon: UserGroupIcon,    end: true },
    { name: 'Employee List', href: '/hr/employees/list', icon: ListBulletIcon,   end: true },
    { name: 'Analytics',     href: '/hr/analytics',      icon: ChartBarIcon,     end: true },
    { name: 'Documents',     href: '/hr/documents',      icon: DocumentTextIcon, end: true },
    { name: 'AI Assistant',  href: '/hr/ai-assistant',   icon: DocumentTextIcon, end: true },
  ];

  const adminNav = [
    { name: 'Dashboard',       href: '/admin/dashboard', icon: HomeIcon,         exact: true },
    { name: 'HR Management',   href: '/admin/hr',        icon: ShieldCheckIcon,  exact: true },
    { name: 'Employees',       href: '/admin/employees', icon: UserGroupIcon,    exact: true },
    { name: 'Templates',       href: '/admin/templates', icon: DocumentTextIcon, exact: true },
    { name: 'Documents',       href: '/admin/documents', icon: FolderIcon,       exact: true },
    { name: 'Audit Log',       href: '/admin/analytics', icon: ClipboardIcon,    exact: true },
    { name: 'System Settings', href: '/admin/settings',  icon: CogIcon,          exact: true },
  ];

  const getNavigation = () => {
    switch (user?.role) {
      case 'admin': return adminNav;
      case 'hr':    return hrNav;
      default:      return employeeNav;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Administrator';
      case 'hr':    return 'HR Manager';
      default:      return 'Employee';
    }
  };

  const navigation = getNavigation();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .gis-sidebar * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .hamburger-trigger {
          position: fixed;
          top: 0;
          left: 0;
          width: 60px;
          height: 60px;
          z-index: 45;
        }

        .hamburger-button {
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }

        .hamburger-trigger:hover .hamburger-button {
          opacity: 1;
        }

        .hamburger-button.visible {
          opacity: 1;
        }

        .sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
          margin-bottom: 2px;
          letter-spacing: 0.01em;
        }

        .sidebar-nav-item:hover {
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.06);
        }

        .sidebar-nav-item.active {
          color: #fff;
          background: #2563eb;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
        }

        .sidebar-nav-item .chevron {
          opacity: 0;
          transform: translateX(-6px);
          transition: all 0.2s ease;
        }

        .sidebar-nav-item:hover .chevron,
        .sidebar-nav-item.active .chevron {
          opacity: 1;
          transform: translateX(0);
        }

        .sidebar-logo-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          position: absolute;
          bottom: -1px;
          right: -1px;
          border: 2px solid #0f172a;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          color: rgba(255,255,255,0.45);
          font-size: 13.5px;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          width: 100%;
          background: none;
          border: none;
          text-align: left;
        }

        .logout-btn:hover {
          color: #f87171;
          background: rgba(248,113,113,0.08);
        }

        .nav-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          padding: 0 14px;
          margin: 10px 0 4px;
        }

        .nav-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 6px 14px;
        }
      `}</style>

      {/* Hamburger Trigger */}
      <div
        className="hamburger-trigger"
        onMouseEnter={() => setIsHamburgerVisible(true)}
        onMouseLeave={() => !isSidebarOpen && setIsHamburgerVisible(false)}
      >
        <button
          onClick={toggleSidebar}
          className={`hamburger-button ${isHamburgerVisible || isSidebarOpen ? 'visible' : ''} fixed top-4 left-4 z-50 p-2 rounded-xl shadow-lg transition-all duration-200`}
          style={{ background: '#1e293b' }}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen
            ? <XMarkIcon className="h-5 w-5 text-white" />
            : <Bars3Icon className="h-5 w-5 text-white" />
          }
        </button>
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={closeSidebar}
        />
      )}

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <div className="rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(248,113,113,0.15)' }}>
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white">Confirm Logout</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Are you sure you want to log out? You will need to log in again to access your account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Panel */}
      <div
        className={`gis-sidebar fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#0f172a' }}
      >
        {/* Logo */}
        <div className="flex-shrink-0 px-5 pt-6 pb-5 mt-12">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base" style={{ background: '#2563eb' }}>
                O
              </div>
              <div className="sidebar-logo-dot"></div>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">OnboardPro</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Onboarding System</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-4 mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: '#2563eb' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{getRoleLabel()}</p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 0 2px rgba(34,197,94,0.25)' }} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3">
          <p className="nav-section-label">Navigation</p>
          <nav>
            {navigation.map((item) => {
              const showDivider = user?.role === 'hr' && item.name === 'Analytics';
              return (
                <React.Fragment key={item.name}>
                  {showDivider && <div className="nav-divider" />}
                  <NavLink
                    to={item.href}
                    end={item.end}
                    onClick={closeSidebar}
                    className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <item.icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRightIcon className="chevron" style={{ width: '14px', height: '14px' }} />
                      </>
                    )}
                  </NavLink>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="flex-shrink-0 p-3 mx-1 mb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={confirmLogout} className="logout-btn">
            <ArrowRightOnRectangleIcon style={{ width: '18px', height: '18px' }} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;