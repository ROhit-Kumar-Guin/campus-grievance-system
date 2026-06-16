import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../api/notification.api.js';
import EmptyState from '../components/ui/EmptyState.jsx';
import toast from 'react-hot-toast';
import { IconTrash, IconCheck } from '@tabler/icons-react';

const typeIcon = {
  status_change:      '📋',
  comment_added:      '💬',
  grievance_assigned: '📌',
  deadline_set:       '⏰',
  grievance_resolved: '✅',
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  // Derive unread count directly from notifications array
  // This is always accurate — no separate state needed
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Load from API every time page mounts
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await handleMarkRead(notif._id);
    if (notif.grievance) {
      const grievanceId = notif.grievance._id || notif.grievance;
      navigate(`/grievances/${grievanceId}`);
    }
  };

  return (
    <AppShell title="Notifications">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Notifications
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {loading
              ? 'Loading...'
              : unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : notifications.length > 0
                  ? 'All caught up!'
                  : 'No notifications yet'
            }
          </p>
        </div>

        {/* Mark all read — show if there are any unread */}
        {!loading && unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            <IconCheck size={13} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400 dark:text-slate-500">
              Loading notifications...
            </span>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications yet"
            description="You'll see updates about your grievances here."
          />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleClick(notif)}
                className={`flex items-start gap-3 px-5 py-4 transition cursor-pointer group ${
                  !notif.isRead
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
                    : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                  !notif.isRead
                    ? 'bg-indigo-100 dark:bg-indigo-950'
                    : 'bg-gray-100 dark:bg-slate-800'
                }`}>
                  {typeIcon[notif.type] || '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium mb-0.5 ${
                    !notif.isRead
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {notif.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                    {notif.message}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString('en-IN', {
                      day:    'numeric',
                      month:  'short',
                      hour:   '2-digit',
                      minute: '2-digit',
                    })}
                    {notif.sender?.name && (
                      <span> · by {notif.sender.name}</span>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div
                  className="flex items-center gap-2 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                  )}
                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 text-red-500 transition"
                    aria-label="Delete notification"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh button */}
      {!loading && notifications.length > 0 && (
        <div className="text-center mt-4">
          <button
            onClick={loadNotifications}
            className="text-xs text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Refresh notifications
          </button>
        </div>
      )}
    </AppShell>
  );
};

export default NotificationsPage;