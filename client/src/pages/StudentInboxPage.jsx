import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import { fetchMyGrievances } from '../api/grievance.api.js';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import toast from 'react-hot-toast';

const statusVariant = {
  'Pending':      'pending',
  'Under Review': 'review',
  'In Progress':  'progress',
  'Resolved':     'resolved',
  'Closed':       'closed',
};

const StudentInboxPage = () => {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Get only the student's own private grievances
        const data = await fetchMyGrievances();
        // Filter only private ones
        const privateGrievances = data.grievances.filter(
          (g) => g.visibility === 'private'
        );
        setGrievances(privateGrievances);
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AppShell title="My Messages">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          My Private Messages
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Private grievances you sent to specific admins
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : grievances.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No private messages"
            description="You haven't sent any private grievances to admins yet."
            action={
              <button
                onClick={() => navigate('/grievances/new')}
                className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Send private grievance
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {grievances.map((g) => (
              <div
                key={g._id}
                onClick={() => navigate(`/messages/${g._id}`)}
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-lg flex-shrink-0">
                  🔒
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {g.title}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {g.category} · {new Date(g.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                    {g.assignedAdmins?.length > 0 && (
                      <span> · Sent to {g.assignedAdmins.length} admin{g.assignedAdmins.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant={statusVariant[g.status]}>{g.status}</Badge>
                  <span className="text-[10px] text-violet-500 font-medium">
                    Private
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

export default StudentInboxPage;