import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import { fetchInbox } from '../../api/message.api.js';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import toast from 'react-hot-toast';

const statusVariant = {
  'Pending':      'pending',
  'Under Review': 'review',
  'In Progress':  'progress',
  'Resolved':     'resolved',
  'Closed':       'closed',
};

const AdminInboxPage = () => {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchInbox();
        setGrievances(data.grievances);
      } catch {
        toast.error('Failed to load inbox');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AppShell title="Private Inbox">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Private Inbox
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Grievances privately sent to you
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : grievances.length === 0 ? (
          <EmptyState
            icon="📬"
            title="No private messages"
            description="No students have sent you private grievances yet."
          />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {grievances.map((g) => (
              <div
                key={g._id}
                onClick={() => navigate(`/admin/messages/${g._id}`)}
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-sm font-semibold text-violet-700 dark:text-violet-300 flex-shrink-0">
                  {g.submittedBy?.name?.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {g.title}
                    </span>
                    {g.unreadMessages > 0 && (
                      <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {g.unreadMessages} new
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    from {g.submittedBy?.name} · {g.submittedBy?.department?.split(' ')[0]}
                  </div>
                </div>

                {/* Status + date */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant={statusVariant[g.status]}>{g.status}</Badge>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">
                    {new Date(g.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminInboxPage;