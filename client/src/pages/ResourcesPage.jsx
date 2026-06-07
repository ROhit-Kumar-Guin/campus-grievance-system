import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import { fetchResources, trackDownload, deleteResource } from '../api/resource.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import UploadResourceModal from '../components/resources/UploadResourceModal.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import toast from 'react-hot-toast';
import {
  IconUpload, IconDownload, IconTrash,
  IconFilter, IconSearch, IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';

// File type icon and color
const fileStyle = (format) => {
  if (format?.includes('pdf'))
    return { icon: '📄', bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-600 dark:text-red-400' };
  if (format?.includes('word') || format?.includes('doc'))
    return { icon: '📝', bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400' };
  if (format?.includes('presentation') || format?.includes('ppt'))
    return { icon: '📊', bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-600 dark:text-orange-400' };
  return { icon: '📁', bg: 'bg-gray-100 dark:bg-slate-800', text: 'text-gray-600 dark:text-slate-400' };
};

const typeBadgeColor = {
  'Notes':      'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
  'PYQ':        'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300',
  'Syllabus':   'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
  'Assignment': 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
  'Other':      'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400',
};

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Information Technology',
];

const ResourcesPage = () => {
  const { isAdmin } = useAuth();
  const [resources, setResources]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showUpload, setShowUpload]   = useState(false);
  const [viewMode, setViewMode]       = useState('grid'); // 'grid' or 'list'
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState({ department: '', type: '' });

  useEffect(() => {
    loadResources();
  }, [filter]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filter).filter(([, v]) => v !== '')
      );
      const data = await fetchResources(params);
      setResources(data.resources);
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

const handleDownload = async (resource) => {
  try {
    await trackDownload(resource._id);
  } catch {
    // tracking failure is non-critical
  }

  // Force download by fetching the file as a blob
  try {
    const response = await fetch(resource.fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resource.originalName || resource.title;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    // Fallback — open in new tab
    window.open(resource.fileUrl, '_blank');
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource? This cannot be undone.')) return;
    try {
      await deleteResource(id);
      toast.success('Resource deleted');
      loadResources();
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  // Client-side search
  const filtered = resources.filter((r) =>
    search === '' ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Resources">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Study Resources
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {resources.length} file{resources.length !== 1 ? 's' : ''} available
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
          >
            <IconUpload size={15} />
            Upload File
          </button>
        )}
      </div>

      {/* Search + Filters + View toggle */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-sm">
          <IconSearch size={13} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or subject..."
            className="bg-transparent text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
          />
        </div>

        <IconFilter size={14} className="text-gray-400" />

        {/* Department filter */}
        <select
          value={filter.department}
          onChange={(e) => setFilter((p) => ({ ...p, department: e.target.value }))}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 outline-none max-w-[200px]"
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d.split(' ')[0]} {d.split(' ')[1]}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={filter.type}
          onChange={(e) => setFilter((p) => ({ ...p, type: e.target.value }))}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 outline-none"
        >
          <option value="">All types</option>
          <option>Notes</option>
          <option>PYQ</option>
          <option>Syllabus</option>
          <option>Assignment</option>
          <option>Other</option>
        </select>

        {/* Clear filters */}
        {(filter.department || filter.type || search) && (
          <button
            onClick={() => { setFilter({ department: '', type: '' }); setSearch(''); }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear
          </button>
        )}

        {/* View toggle */}
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

      {/* Content */}
      {loading ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          : 'flex flex-col gap-3'
        }>
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No resources found"
          description={isAdmin
            ? "Upload the first resource using the button above."
            : "No study materials available yet. Check back later."
          }
          action={isAdmin && (
            <button
              onClick={() => setShowUpload(true)}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Upload first resource
            </button>
          )}
        />
      ) : viewMode === 'grid' ? (
        /* Grid view */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((r) => {
            const style = fileStyle(r.fileFormat);
            return (
              <div
                key={r._id}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group"
              >
                {/* File icon area */}
                <div className={`${style.bg} p-6 flex items-center justify-center`}>
                  <span className="text-4xl">{style.icon}</span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="text-xs font-medium text-gray-800 dark:text-gray-100 mb-1 truncate">
                    {r.title}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 mb-2 truncate">
                    {r.subject}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadgeColor[r.type]}`}>
                      {r.type}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">
                      {r.downloads} downloads
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(r)}
                      className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-1.5 rounded-lg transition"
                    >
                      <IconDownload size={12} />
                      Download
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
                      >
                        <IconTrash size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {/* List header */}
          <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50 dark:bg-slate-800/50 text-xs font-medium text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800">
            <span className="col-span-4">Title</span>
            <span className="col-span-2">Subject</span>
            <span className="col-span-2">Department</span>
            <span className="col-span-1">Type</span>
            <span className="col-span-1">Downloads</span>
            <span className="col-span-2">Actions</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {filtered.map((r) => {
              const style = fileStyle(r.fileFormat);
              return (
                <div
                  key={r._id}
                  className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {/* Title */}
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className="text-base">{style.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {r.title}
                    </span>
                  </div>
                  {/* Subject */}
                  <span className="col-span-2 text-xs text-gray-500 dark:text-slate-400 truncate">
                    {r.subject}
                  </span>
                  {/* Department */}
                  <span className="col-span-2 text-xs text-gray-500 dark:text-slate-400 truncate">
                    {r.department.split(' ')[0]}
                  </span>
                  {/* Type */}
                  <div className="col-span-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadgeColor[r.type]}`}>
                      {r.type}
                    </span>
                  </div>
                  {/* Downloads */}
                  <span className="col-span-1 text-xs text-gray-400 dark:text-slate-500">
                    {r.downloads}
                  </span>
                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(r)}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-1.5 rounded-lg transition"
                    >
                      <IconDownload size={12} />
                      Open
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
                      >
                        <IconTrash size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadResourceModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            loadResources();
          }}
        />
      )}
    </AppShell>
  );
};

export default ResourcesPage;