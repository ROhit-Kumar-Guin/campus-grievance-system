import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { fetchGrievances } from '../api/grievance.api.js';
import { fetchSummary } from '../api/analytics.api.js';
import {
  IconAlertCircle, IconCheck,
  IconClock, IconUsers, IconArrowRight,
} from '@tabler/icons-react';

const statusVariant = {
  'Pending': 'pending', 'Under Review': 'review',
  'In Progress': 'progress', 'Resolved': 'resolved', 'Closed': 'closed',
};
const priorityVariant = {
  'High': 'high', 'Medium': 'medium', 'Low': 'low',
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [grievanceData, summaryData] = await Promise.all([
  fetchGrievances({ limit: 10 }),
  fetchSummary(),
]);
setGrievances(grievanceData.grievances);
setTotalStudents(summaryData.summary.totalStudents);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total      = grievances.length;
  const pending    = grievances.filter(g => g.status === 'Pending').length;
  const resolved   = grievances.filter(g => g.status === 'Resolved').length;
  const inProgress = grievances.filter(g => g.status === 'In Progress').length;

  return (
    <AppShell title="Admin Overview">

      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Admin Overview
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          Welcome back, {user?.name}. Here's what needs your attention.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Issues"
          value={total}
          color="indigo"
          icon={<IconAlertCircle size={18} className="text-indigo-600 dark:text-indigo-400" />}
          delta={12}
        />
        <StatCard
          label="Pending Review"
          value={pending}
          color="amber"
          icon={<IconClock size={18} className="text-amber-600 dark:text-amber-400" />}
        />
        <StatCard
          label="Resolved"
          value={resolved}
          color="green"
          icon={<IconCheck size={18} className="text-emerald-600 dark:text-emerald-400" />}
          delta={8}
        />
        <StatCard
          label="Total Students"
          value={totalStudents}
          color="violet"
          icon={<IconUsers size={18} className="text-violet-600 dark:text-violet-400" />}
        />
      </div>

      {/* Grievances table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Recent Grievances
          </h3>
          <button
            onClick={() => navigate('/admin/grievances')}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all <IconArrowRight size={12} />
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-5 gap-3 px-5 py-2.5 bg-gray-50 dark:bg-slate-800/50 text-xs font-medium text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800">
          <span className="col-span-2">Issue</span>
          <span>Category</span>
          <span>Priority</span>
          <span>Status</span>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
            Loading...
          </div>
        ) : grievances.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
            No grievances yet.
          </div>
        ) : (
          /* Table rows */
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {grievances.map((g) => (
              <div
                key={g._id}
                onClick={() => navigate(`/admin/grievances/${g._id}`)}
                className="grid grid-cols-5 gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition items-center"
              >
                {/* Title + submitted by */}
                <div className="col-span-2 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {g.title}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {/* g.submittedBy is an object — use .name */}
                    by {g.isAnonymous ? 'Anonymous' : g.submittedBy?.name || 'Unknown'}
                    {g.deadline
                      ? ` · Due ${new Date(g.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                      : ''
                    }
                  </div>
                </div>

                {/* Category */}
                <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full w-fit">
                  {g.category}
                </span>

                {/* Priority */}
                <Badge variant={priorityVariant[g.priority]}>
                  {g.priority}
                </Badge>

                {/* Status */}
                <Badge variant={statusVariant[g.status]}>
                  {g.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminDashboard;