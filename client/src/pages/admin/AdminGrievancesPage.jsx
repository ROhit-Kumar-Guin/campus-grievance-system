import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { fetchGrievances } from '../../api/grievance.api.js';
import { IconFilter, IconSearch } from '@tabler/icons-react';

const statusVariant = {
  'Pending': 'pending', 'Under Review': 'review',
  'In Progress': 'progress', 'Resolved': 'resolved', 'Closed': 'closed',
};
const priorityVariant = {
  'High': 'high', 'Medium': 'medium', 'Low': 'low',
};
const categoryEmoji = {
  'Academic': '📚', 'Infrastructure': '🏗️',
  'Administration': '📋', 'Personal': '👤',
};

const AdminGrievancesPage = () => {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '', category: '', priority: '',
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadGrievances();
  }, [filter]);

  const loadGrievances = async () => {
    setLoading(true);
    try {
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

  // Client-side search filter
  const filtered = grievances.filter((g) =>
    search === '' ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.submittedBy?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Count by status for the mini stats row
  const counts = {
    total:    grievances.length,
    pending:  grievances.filter(g => g.status === 'Pending').length,
    progress: grievances.filter(g => g.status === 'In Progress').length,
    resolved: grievances.filter(g => g.status === 'Resolved').length,
  };

  return (
    <AppShell title="All Grievances">
      {/* Page header */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          All Grievances
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Manage and resolve student issues
        </p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total',       value: counts.total,    color: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' },
          { label: 'Pending',     value: counts.pending,  color: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400' },
          { label: 'In Progress', value: counts.progress, color: 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400' },
          { label: 'Resolved',    value: counts.resolved, color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-3 border border-transparent`}>
            <div className="text-xl font-semibold">{s.value}</div>
            <div className="text-xs mt-0.5 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex-1 min-w-[180px] max-w-xs">
          <IconSearch size={13} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or student..."
            className="bg-transparent text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
          />
        </div>

        <IconFilter size={14} className="text-gray-400" />

        {/* Status */}
        <select
          value={filter.status}
          onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 outline-none"
        >
          <option value="">All statuses</option>
          <option>Pending</option>
          <option>Under Review</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>

        {/* Category */}
        <select
          value={filter.category}
          onChange={(e) => setFilter((p) => ({ ...p, category: e.target.value }))}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 outline-none"
        >
          <option value="">All categories</option>
          <option>Academic</option>
          <option>Infrastructure</option>
          <option>Administration</option>
          <option>Personal</option>
        </select>

        {/* Priority */}
        <select
          value={filter.priority}
          onChange={(e) => setFilter((p) => ({ ...p, priority: e.target.value }))}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 outline-none"
        >
          <option value="">All priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        {/* Clear */}
        {(filter.status || filter.category || filter.priority || search) && (
          <button
            onClick={() => { setFilter({ status: '', category: '', priority: '' }); setSearch(''); }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50 dark:bg-slate-800/50 text-xs font-medium text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800">
          <span className="col-span-4">Issue</span>
          <span className="col-span-2">Student</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-1">Priority</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-1">Due</span>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No grievances found"
            description="No issues match your current filters."
          />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {filtered.map((g) => (
              <div
                key={g._id}
                onClick={() => navigate(`/admin/grievances/${g._id}`)}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition items-center"
              >
                {/* Title */}
                <div className="col-span-4 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {g.title}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    #{g._id.slice(-6).toUpperCase()}
                  </div>
                </div>

                {/* Student */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                      {g.isAnonymous ? '?' : g.submittedBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-slate-300 truncate">
                      {g.isAnonymous ? 'Anonymous' : g.submittedBy?.name}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-full">
                    {categoryEmoji[g.category]} {g.category}
                  </span>
                </div>

                {/* Priority */}
                <div className="col-span-1">
                  <Badge variant={priorityVariant[g.priority]}>{g.priority}</Badge>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <Badge variant={statusVariant[g.status]}>{g.status}</Badge>
                </div>

                {/* Deadline */}
                <div className="col-span-1">
                  {g.deadline ? (
                    <span className={`text-xs ${
                      new Date(g.deadline) < new Date() && !['Resolved','Closed'].includes(g.status)
                        ? 'text-red-500 font-medium'
                        : 'text-gray-400 dark:text-slate-500'
                    }`}>
                      {new Date(g.deadline).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short'
                      })}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-slate-600">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminGrievancesPage;