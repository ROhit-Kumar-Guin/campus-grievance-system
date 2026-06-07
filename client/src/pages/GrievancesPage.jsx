import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import Badge from '../components/ui/Badge.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { fetchGrievances } from '../api/grievance.api.js';
import { IconPlus, IconFilter } from '@tabler/icons-react';

const statusVariant = {
  'Pending':      'pending',
  'Under Review': 'review',
  'In Progress':  'progress',
  'Resolved':     'resolved',
  'Closed':       'closed',
};

const priorityVariant = {
  'High': 'high', 'Medium': 'medium', 'Low': 'low',
};

const categoryEmoji = {
  'Academic': '📚', 'Infrastructure': '🏗️',
  'Administration': '📋', 'Personal': '👤',
};

const GrievancesPage = () => {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '' });

  useEffect(() => {
    loadGrievances();
  }, [filter]);

  const loadGrievances = async () => {
    setLoading(true);
    try {
      // Remove empty filters before sending
      const params = Object.fromEntries(
        Object.entries(filter).filter(([, v]) => v !== '')
      );
      const data = await fetchGrievances(params);
      setGrievances(data.grievances);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="My Issues">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            My Grievances
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {grievances.length} issue{grievances.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
        <button
          onClick={() => navigate('/grievances/new')}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
        >
          <IconPlus size={15} />
          New Issue
        </button>
      </div>

      {/* Filters */}
<div className="flex items-center gap-2 mb-4 flex-wrap">
  <IconFilter size={14} className="text-gray-400" />
  <select
    value={filter.status}
    onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))}
    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 outline-none"
  >
    <option value="">All statuses</option>
    <option value="Pending">Pending</option>
    <option value="Under Review">Under Review</option>
    <option value="In Progress">In Progress</option>
    <option value="Resolved">Resolved</option>
    <option value="Closed">Closed</option>
  </select>

  <select
    value={filter.category}
    onChange={(e) => setFilter((p) => ({ ...p, category: e.target.value }))}
    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 outline-none"
  >
    <option value="">All categories</option>
    <option value="Academic">Academic</option>
    <option value="Infrastructure">Infrastructure</option>
    <option value="Administration">Administration</option>
    <option value="Personal">Personal</option>
  </select>

  {(filter.status || filter.category) && (
    <button
      onClick={() => setFilter({ status: '', category: '' })}
      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
    >
      Clear filters
    </button>
  )}
</div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : grievances.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No issues found"
            description="You haven't submitted any grievances yet, or none match your filters."
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
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                {/* Category icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${
                  g.category === 'Academic'       ? 'bg-indigo-100 dark:bg-indigo-950' :
                  g.category === 'Infrastructure' ? 'bg-red-100 dark:bg-red-950' :
                  g.category === 'Administration' ? 'bg-amber-100 dark:bg-amber-950' :
                                                    'bg-gray-100 dark:bg-slate-700'
                }`}>
                  {categoryEmoji[g.category]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {g.isAnonymous ? 'Anonymous Submission' : g.title}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {g.category} · {new Date(g.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                    {g.deadline && (
                      <span className={`ml-2 ${
                        new Date(g.deadline) < new Date() && g.status !== 'Resolved' && g.status !== 'Closed'
                          ? 'text-red-500'
                          : ''
                      }`}>
                        · Due {new Date(g.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={priorityVariant[g.priority]}>{g.priority}</Badge>
                  <Badge variant={statusVariant[g.status]}>{g.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default GrievancesPage;