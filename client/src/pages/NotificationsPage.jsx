import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../api/notification.api.js';
import { useSocket } from '../context/SocketContext.jsx';
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
  const {
    notifications,
    unreadCount,
    addNotifications,
    removeNotification,
    markAllReadLocally,
    markOneReadLocally,
  } = useSocket();
  const [loading, setLoading] = useState(true);

  // Load from API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotifications();
        addNotifications(data.notifications);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      markOneReadLocally(id);
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      markAllReadLocally();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      removeNotification(id);
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await handleMarkRead(notif._id);
    if (notif.grievance) {
      navigate(`/grievances/${notif.grievance._id || notif.grievance}`);
    }
  };

  return (
    <AppShell title="Notifications">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Notifications
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <IconCheck size={13} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
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
                      day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {notif.sender && <span> · by {notif.sender.name}</span>}
                  </div>
                </div>

                {/* Unread dot + delete */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 text-red-500 transition"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default NotificationsPage;