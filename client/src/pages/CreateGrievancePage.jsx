import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import toast from 'react-hot-toast';
import { IconSend, IconArrowLeft } from '@tabler/icons-react';
import axiosInstance from '../api/axiosInstance.js';

const CATEGORIES = ['Academic', 'Infrastructure', 'Administration', 'Personal'];
const PRIORITIES = ['High', 'Medium', 'Low'];

const priorityColors = {
  High:   'border-red-400 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400',
  Medium: 'border-amber-400 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  Low:    'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
};

const CreateGrievancePage = () => {
  const navigate = useNavigate();

  // ── All state inside the component ──────────────────────────
  const [loading, setLoading]               = useState(false);
  const [file, setFile]                     = useState(null);
  const [dragOver, setDragOver]             = useState(false);
  const [admins, setAdmins]                 = useState([]);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [formData, setFormData]             = useState({
    title:       '',
    description: '',
    category:    '',
    priority:    'Medium',
    visibility:  'public',   // ← fixed: was 'isAnonymous'
  });

  // ── Load admins for private grievance targeting ──────────────
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const res = await axiosInstance.get('/auth/admins');
        setAdmins(res.data.admins);
      } catch {
        // fail silently
      }
    };
    loadAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.title.trim())       return toast.error('Please enter a title');
  if (!formData.description.trim()) return toast.error('Please enter a description');
  if (!formData.category)           return toast.error('Please select a category');
  if (formData.visibility === 'private' && selectedAdmins.length === 0) {
    return toast.error('Please select at least one admin for private grievance');
  }

  setLoading(true);
  try {
    const data = new FormData();
    data.append('title',       formData.title);
    data.append('description', formData.description);
    data.append('category',    formData.category);
    data.append('priority',    formData.priority);
    data.append('visibility',  formData.visibility);

    // Append each selected admin ID separately
    if (formData.visibility === 'private') {
      selectedAdmins.forEach((id) => {
        data.append('assignedAdmins[]', id);
      });
    }

    if (file) data.append('file', file);

    await axiosInstance.post('/grievances', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    toast.success(
      formData.visibility === 'private'
        ? 'Private grievance sent to selected admins!'
        : 'Grievance submitted successfully!'
    );
    navigate('/grievances');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to submit grievance');
  } finally {
    setLoading(false);
  }
};

  return (
    <AppShell title="New Issue">
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate('/grievances')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-5 transition"
        >
          <IconArrowLeft size={16} />
          Back to issues
        </button>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Submit a new grievance
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              Fill in the details below. Be as specific as possible.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title describing the issue"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, category: cat }))}
                    className={`py-2.5 px-3 rounded-lg border text-sm text-left transition ${
                      formData.category === cat
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {cat === 'Academic'       ? '📚' :
                     cat === 'Infrastructure' ? '🏗️' :
                     cat === 'Administration' ? '📋' : '👤'} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Priority
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                      formData.priority === p
                        ? priorityColors[p]
                        : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-500 hover:border-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the issue in detail. Include dates, locations, and any relevant context..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {formData.description.length} characters
              </div>
            </div>

            {/* File attachment */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Attachment (optional)
              </label>
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const dropped = e.dataTransfer.files[0];
                  if (dropped) setFile(dropped);
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('grievance-file').click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                    : file
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-gray-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20'
                }`}
              >
                <input
                  id="grievance-file"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                      ✓ {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl mb-1">☁️</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      Drag & drop or{' '}
                      <span className="text-indigo-600 dark:text-indigo-400">browse</span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      PDF, JPG, PNG up to 5 MB
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Visibility selector */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, visibility: 'public' }))}
                  className={`py-3 px-3 rounded-lg border text-sm text-left transition ${
                    formData.visibility === 'public'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-base mb-1">🌐</div>
                  <div className="font-medium">Public</div>
                  <div className="text-xs opacity-70 mt-0.5">Visible to all students & admins</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, visibility: 'private' }))}
                  className={`py-3 px-3 rounded-lg border text-sm text-left transition ${
                    formData.visibility === 'private'
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-medium'
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-base mb-1">🔒</div>
                  <div className="font-medium">Private</div>
                  <div className="text-xs opacity-70 mt-0.5">Send to specific admins only</div>
                </button>
              </div>

              {/* Admin selector — only when private */}
              {formData.visibility === 'private' && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                    Select admins to send to:
                  </div>
                  {admins.length === 0 ? (
                    <div className="text-xs text-gray-400 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      Loading admins...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {admins.map((admin) => (
                        <label
                          key={admin._id}
                          className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAdmins.includes(admin._id)}
                            onChange={() => {
                              setSelectedAdmins((prev) =>
                                prev.includes(admin._id)
                                  ? prev.filter((id) => id !== admin._id)
                                  : [...prev, admin._id]
                              );
                            }}
                            className="w-4 h-4 accent-indigo-600"
                          />
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs font-medium text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                            {admin.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                              {admin.name}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500">
                              {admin.department}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/grievances')}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <IconSend size={15} />
                    Submit Issue
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AppShell>
  );
};

export default CreateGrievancePage;