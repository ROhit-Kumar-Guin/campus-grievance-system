import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  IconLayoutDashboard, IconAlertCircle, IconCirclePlus,
  IconBooks, IconNews, IconBell, IconChartPie,
  IconSettings, IconUsers, IconLogout, IconSchool,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

const studentNav = [
  { label: 'Dashboard',     icon: IconLayoutDashboard, to: '/dashboard' },
  { label: 'My Issues',     icon: IconAlertCircle,     to: '/grievances' },
  { label: 'New Issue',     icon: IconCirclePlus,      to: '/grievances/new' },
  { label: 'Resources',     icon: IconBooks,           to: '/resources' },
  { label: 'Stories',       icon: IconNews,            to: '/stories' },
  { label: 'Notifications', icon: IconBell,            to: '/notifications' },
  { label: 'Analytics',     icon: IconChartPie,        to: '/analytics' },
];

const adminNav = [
  { label: 'Overview',    icon: IconLayoutDashboard, to: '/admin' },
  { label: 'All Issues',  icon: IconAlertCircle,     to: '/admin/grievances' },
  { label: 'Analytics',   icon: IconChartPie,        to: '/admin/analytics' },
  { label: 'Users',       icon: IconUsers,           to: '/admin/users' },
  { label: 'Resources',   icon: IconBooks,           to: '/admin/resources' },
  { label: 'Stories',     icon: IconNews,            to: '/admin/stories' },
  { label: 'Settings',    icon: IconSettings,        to: '/admin/settings' },
];

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
      isActive
        ? isAdmin
          ? 'bg-white/15 text-white font-medium'
          : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
        : isAdmin
          ? 'text-white/60 hover:bg-white/10 hover:text-white'
          : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-gray-200'
    }`;

  return (
    <aside className={`w-[200px] min-h-screen flex flex-col border-r py-4 px-2.5 fixed left-0 top-0 z-30 ${
      isAdmin
        ? 'bg-[#1E1B4B] border-white/10'
        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isAdmin ? 'bg-white/20' : 'bg-indigo-600'
        }`}>
          <IconSchool size={16} color="white" />
        </div>
        <div>
          <div className={`text-xs font-semibold leading-tight ${
            isAdmin ? 'text-white' : 'text-gray-800 dark:text-gray-100'
          }`}>
            CampusGrieve
          </div>
          <div className={`text-[10px] leading-tight ${
            isAdmin ? 'text-white/40' : 'text-gray-400 dark:text-slate-500'
          }`}>
            {isAdmin ? 'Admin Panel' : 'VBU Portal'}
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className={`text-[10px] font-medium uppercase tracking-wider px-3 mb-2 ${
        isAdmin ? 'text-white/30' : 'text-gray-400 dark:text-slate-600'
      }`}>
        {isAdmin ? 'Management' : 'Menu'}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/admin'}
            className={navLinkClass}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className={`border-t pt-3 mt-3 ${
        isAdmin ? 'border-white/10' : 'border-gray-100 dark:border-slate-800'
      }`}>
        <div className={`flex items-center gap-2 px-2 py-2 rounded-lg mb-1 ${
          isAdmin ? 'bg-white/5' : 'bg-gray-50 dark:bg-slate-800'
        }`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
            isAdmin
              ? 'bg-white/20 text-white'
              : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
          }`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-medium truncate ${
              isAdmin ? 'text-white' : 'text-gray-800 dark:text-gray-200'
            }`}>
              {user?.name}
            </div>
            <div className={`text-[10px] truncate ${
              isAdmin ? 'text-white/40' : 'text-gray-400 dark:text-slate-500'
            }`}>
              {user?.role} · {user?.department?.split(' ')[0]}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
            isAdmin
              ? 'text-white/50 hover:bg-white/10 hover:text-white'
              : 'text-gray-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          <IconLogout size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;