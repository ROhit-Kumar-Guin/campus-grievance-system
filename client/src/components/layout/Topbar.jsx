import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell, IconSearch, IconPlus, IconSun, IconMoon } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { fetchNotifications } from '../../api/notification.api.js';

const Topbar = ({ title }) => {
  const { user, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount, resetUnreadCount, addNotifications } = useSocket();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Load initial unread count from API on mount
  useEffect(() => {
    const loadUnread = async () => {
      try {
        const data = await fetchNotifications();
        addNotifications(data.notifications);
      } catch {
        // fail silently
      }
    };
    loadUnread();
  }, []);

  const handleBellClick = () => {
    resetUnreadCount();
    navigate(isAdmin ? '/admin/notifications' : '/notifications');
  };

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center px-5 gap-3 sticky top-0 z-20">
      <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mr-2 hidden sm:block">
        {title}
      </h1>

      <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 flex-1 max-w-xs">
        <IconSearch size={14} className="text-gray-400 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-transparent text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle dark mode"
        >
          {isDark
            ? <IconSun size={17} className="text-amber-400" />
            : <IconMoon size={17} className="text-gray-500" />
          }
        </button>

        {/* Notification bell */}
        <button
          onClick={handleBellClick}
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <IconBell size={18} className="text-gray-500 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {!isAdmin && (
          <button
            onClick={() => navigate('/grievances/new')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition"
          >
            <IconPlus size={14} />
            New Issue
          </button>
        )}

        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-semibold text-indigo-700 dark:text-indigo-300 cursor-pointer">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Topbar;