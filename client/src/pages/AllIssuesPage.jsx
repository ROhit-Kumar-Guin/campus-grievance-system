import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import Badge from '../components/ui/Badge.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { fetchGrievances } from '../api/grievance.api.js';
import {
  IconFilter, IconLayoutGrid, IconList,
} from '@tabler/icons-react';

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

const categoryBg = {
  'Academic':       'bg-indigo-100 dark:bg-indigo-950',
  'Infrastructure': 'bg-red-100 dark:bg-red-950',
  'Administration': 'bg-amber-100 dark:bg-amber-950',
  'Personal':       'bg-gray-100 dark:bg-slate-700',
};

const IssueCard = ({ g, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition group"
  >
    {g.attachments?.length > 0 &&
      (g.attachments[0].url?.match(/\.(jpg|jpeg|png|webp)/i) ||
       g.attachments[0].originalName?.match(/\.(jpg|jpeg|png)/i)) && (
      <div className="h-36 overflow-hidden">
        <img
          src={g.attachments[0].url}
          alt="attachment"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryBg[g.category]} text-gray-700 dark:text-gray-300`}>
          {categoryEmoji[g.category]} {g.category}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-slate-500">
          {new Date(g.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short',
          })}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-2">
        {g.title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">
        {g.description}
      </p>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[9px] font-semibold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
          {g.submittedBy?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
          {g.submittedBy?.name} · {g.submittedBy?.department?.split(' ')[0]}
        </span>
      </div>
      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-slate-800">
        <Badge variant={priorityVariant[g.priority]}>{g.priority}</Badge>
        <Badge variant={statusVariant[g.status]}>{g.status}</Badge>
      </div>
    </div>
  </div>
);

const IssueListItem = ({ g, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition"
  >
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${categoryBg[g.category]}`}>
      {categoryEmoji[g.category]}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
        {g.title}
      </p>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
        by {g.submittedBy?.name} · {g.category} · {new Date(g.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
        })}
      </p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="hidden sm:block">
        <Badge variant={priorityVariant[g.priority]}>{g.priority}</Badge>
      </span>
      <Badge variant={statusVariant[g.status]}>{g.status}</Badge>
    </div>
  </div>
);

const AllIssuesPage = () => {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [viewMode, setViewMode]     = useState('list');
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState({ status: '', category: '' });

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
    } catch {
      console.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const filtered = grievances.filter((g) =>
    search === '' ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase()) ||
    g.submittedBy?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="All Issues">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            All Issues
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {grievances.length} public issue{grievances.length !== 1 ? 's' : ''} from all students
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search all issues..."
          className="flex-1 min-w-[150px] max-w-xs px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <IconFilter size={14} className="text-gray-400 hidden sm:block" />
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
        {(filter.status || filter.category || search) && (
          <button
            onClick={() => { setFilter({ status: '', category: '' }); setSearch(''); }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear
          </button>
        )}
        <div className="flex items-center gap-1 ml-auto bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <IconLayoutGrid size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <IconList size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-2'
        }>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No issues found"
          description="No public grievances match your filters."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <IssueCard
              key={g._id}
              g={g}
              onClick={() => navigate(`/all-issues/${g._id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {filtered.map((g) => (
              <IssueListItem
                key={g._id}
                g={g}
                onClick={() => navigate(`/all-issues/${g._id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default AllIssuesPage;