import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { fetchGrievances } from '../api/grievance.api.js';
import {
  IconAlertCircle, IconLoader, IconCheck,
  IconClock, IconArrowRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const statusVariant = {
  'Pending': 'pending', 'Under Review': 'review',
  'In Progress': 'progress', 'Resolved': 'resolved', 'Closed': 'closed',
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const firstName = user?.name?.split(' ')[0];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchGrievances({ limit: 5 });
        setGrievances(data.grievances);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total      = grievances.length;
  const inProgress = grievances.filter(g => g.status === 'In Progress').length;
  const resolved   = grievances.filter(g => g.status === 'Resolved').length;
  const pending    = grievances.filter(g => g.status === 'Pending').length;


  return (
    <AppShell title="Dashboard">
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Good morning, {firstName} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's an overview of your grievances and activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Submitted"
          value={total}
          color="indigo"
          icon={<IconAlertCircle size={18} className="text-indigo-600" />}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          color="amber"
          icon={<IconLoader size={18} className="text-amber-600" />}
        />
        <StatCard
          label="Resolved"
          value={resolved}
          color="green"
          icon={<IconCheck size={18} className="text-emerald-600" />}
        />
        <StatCard
          label="Pending"
          value={pending}
          color="red"
          icon={<IconClock size={18} className="text-red-500" />}
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent grievances — takes 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-slate-800">
  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Issues</h3>
            <button
              onClick={() => navigate('/grievances')}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
            >
              View all <IconArrowRight size={12} />
            </button>
          </div>

          {grievances.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No issues yet"
              description="You haven't submitted any grievances yet."
              action={
                <button
                  onClick={() => navigate('/grievances/new')}
                  className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Submit your first issue
                </button>
              }
            />
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-slate-800">
{grievances.map((g) => (
  <div
    key={g._id}
    onClick={() => navigate(`/grievances/${g._id}`)}
    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition"
  >
    {/* Category icon */}
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base
      ${g.category === 'Academic'       ? 'bg-indigo-100 dark:bg-indigo-950' :
        g.category === 'Infrastructure' ? 'bg-red-100 dark:bg-red-950' :
        g.category === 'Administration' ? 'bg-amber-100 dark:bg-amber-950' :
                                          'bg-gray-100 dark:bg-slate-700'}`}
    >
      {g.category === 'Academic'       ? '📚' :
       g.category === 'Infrastructure' ? '🏗️' :
       g.category === 'Administration' ? '📋' : '👤'}
    </div>

    {/* Title and meta */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
        {g.isAnonymous ? 'Anonymous Submission' : g.title}
      </p>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
        {g.category} · {new Date(g.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        })}
      </p>
    </div>

    {/* Status badge */}
    <Badge variant={statusVariant[g.status]}>
      {g.status}
    </Badge>
  </div>
))}
            </div>
          )}
        </div>

        {/* Right column */}
        {/* Right column */}
<div className="flex flex-col gap-4">

  {/* Quick actions */}
  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
      Quick Actions
    </h3>
    <div className="flex flex-col gap-2">
      <button
        onClick={() => navigate('/grievances/new')}
        className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2.5 rounded-lg transition"
      >
        <IconAlertCircle size={15} />
        Submit New Issue
      </button>
      <button
        onClick={() => navigate('/resources')}
        className="w-full flex items-center gap-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-2.5 rounded-lg transition border border-gray-200 dark:border-slate-700"
      >
        📚 Browse Resources
      </button>
      <button
        onClick={() => navigate('/stories')}
        className="w-full flex items-center gap-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-2.5 rounded-lg transition border border-gray-200 dark:border-slate-700"
      >
        📰 View Stories
      </button>
    </div>
  </div>

  {/* Department info card — keep indigo bg, always looks good */}
  <div className="bg-indigo-600 rounded-xl p-4 text-white">
    <div className="text-xs text-indigo-200 mb-1">Your department</div>
    <div className="text-sm font-semibold mb-0.5">{user?.department}</div>
    <div className="text-xs text-indigo-200">
      Roll No: {user?.rollNumber || 'Not set'}
    </div>
    <div className="mt-3 pt-3 border-t border-indigo-500 flex justify-between text-xs text-indigo-200">
      <span>Semester 8</span>
      <span>{user?.role}</span>
    </div>
  </div>

</div>
      </div>
    </AppShell>
  );
};

export default StudentDashboard;