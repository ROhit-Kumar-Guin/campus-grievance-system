import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import Badge from '../components/ui/Badge.jsx';
import { fetchGrievanceById, addComment, updateGrievanceStatus, assignGrievance } from '../api/grievance.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  IconArrowLeft, IconSend, IconCalendar,
  IconUser, IconBuilding, IconClock,
} from '@tabler/icons-react';

const statusVariant = {
  'Pending': 'pending', 'Under Review': 'review',
  'In Progress': 'progress', 'Resolved': 'resolved', 'Closed': 'closed',
};

// The 5 workflow steps in order
const WORKFLOW = ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Closed'];

const GrievanceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin assign form
  const [assignForm, setAssignForm] = useState({ assignedTo: '', deadline: '' });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadGrievance();
  }, [id]);

  const loadGrievance = async () => {
    setLoading(true);
    try {
      const data = await fetchGrievanceById(id);
      setGrievance(data.grievance);
      setAssignForm({
        assignedTo: data.grievance.assignedTo || '',
        deadline: data.grievance.deadline
          ? new Date(data.grievance.deadline).toISOString().split('T')[0]
          : '',
      });
    } catch (error) {
      toast.error('Failed to load grievance');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(id, commentText);
      setCommentText('');
      await loadGrievance(); // Refresh to show new comment
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateGrievanceStatus(id, newStatus);
      await loadGrievance();
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await assignGrievance(id, assignForm);
      await loadGrievance();
      toast.success('Grievance assigned');
    } catch {
      toast.error('Failed to assign grievance');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Issue Detail">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!grievance) return null;

  const currentStepIndex = WORKFLOW.indexOf(grievance.status);
  const isOverdue = grievance.deadline &&
    new Date(grievance.deadline) < new Date() &&
    !['Resolved', 'Closed'].includes(grievance.status);

  return (
    <AppShell title="Issue Detail">
      {/* Back button */}
      <button
        onClick={() => navigate(isAdmin ? '/admin/grievances' : '/grievances')}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-5 transition"
      >
        <IconArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — main content */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Grievance header card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5">
            {/* ID + date */}
            <div className="text-xs text-gray-400 dark:text-slate-500 mb-2">
              #{grievance._id.slice(-8).toUpperCase()} · Submitted {new Date(grievance.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </div>

            {/* Title */}
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
              {grievance.title}
            </h2>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                {grievance.category}
              </span>
              <Badge variant={grievance.priority.toLowerCase()}>{grievance.priority} Priority</Badge>
              <Badge variant={statusVariant[grievance.status]}>{grievance.status}</Badge>
              {grievance.isAnonymous && (
                <span className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 px-2.5 py-1 rounded-full">
                  Anonymous
                </span>
              )}
              {isOverdue && (
                <span className="text-xs bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full font-medium">
                  ⚠️ Overdue
                </span>
              )}
            </div>

            {/* Workflow stepper */}
            <div className="relative mb-4">
              {/* Connector line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 dark:bg-slate-800 z-0" />
              <div className="flex justify-between relative z-10">
                {WORKFLOW.map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition ${
                      i < currentStepIndex
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : i === currentStepIndex
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400'
                    }`}>
                      {i < currentStepIndex ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] text-center max-w-[60px] leading-tight ${
                      i === currentStepIndex
                        ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-gray-400 dark:text-slate-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Description</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {grievance.description}
              </p>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <IconUser size={14} className="text-gray-400" />
                <div>
                  <div className="text-[10px] text-gray-400">Submitted by</div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {grievance.isAnonymous ? 'Anonymous' : grievance.submittedBy?.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconBuilding size={14} className="text-gray-400" />
                <div>
                  <div className="text-[10px] text-gray-400">Assigned to</div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {grievance.assignedTo || 'Not assigned yet'}
                  </div>
                </div>
              </div>
              {grievance.deadline && (
                <div className="flex items-center gap-2">
                  <IconCalendar size={14} className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
                  <div>
                    <div className="text-[10px] text-gray-400">Deadline</div>
                    <div className={`text-xs font-medium ${
                      isOverdue ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {new Date(grievance.deadline).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline + Comments */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Activity & Comments
              </h3>
            </div>

            <div className="p-5">
              {/* Timeline items */}
              {grievance.comments.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 mb-5">
                  No activity yet.
                </p>
              ) : (
                <div className="space-y-4 mb-5">
                  {grievance.comments.map((comment, i) => (
                    <div key={comment._id} className="flex gap-3">
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        comment.author?.role === 'Admin'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      }`}>
                        {comment.author?.name?.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {comment.author?.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            comment.author?.role === 'Admin'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                          }`}>
                            {comment.author?.role}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto">
                            {new Date(comment.createdAt).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className={`text-sm rounded-lg px-3 py-2 ${
                          comment.type !== 'comment'
                            ? 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 italic text-xs'
                            : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment form */}
              <form onSubmit={handleComment}>
                <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment or update..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none resize-none"
                  />
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                    <span className="text-xs text-gray-400">Be clear and specific</span>
                    <button
                      type="submit"
                      disabled={submitting || !commentText.trim()}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <IconSend size={13} />
                      )}
                      Post
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right sidebar — admin actions OR student info */}
        <div className="flex flex-col gap-4">
          {isAdmin ? (
            <>
              {/* Status update */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Update Status
                </h3>
                <div className="flex flex-col gap-2">
                  {WORKFLOW.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={grievance.status === s}
                      className={`py-2 px-3 rounded-lg text-sm text-left transition border ${
                        grievance.status === s
                          ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-medium cursor-default'
                          : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    >
                      {grievance.status === s ? '● ' : '○ '}{s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign + deadline */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Assign & Set Deadline
                </h3>
                <form onSubmit={handleAssign} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">
                      Department
                    </label>
                    <select
                      value={assignForm.assignedTo}
                      onChange={(e) => setAssignForm((p) => ({ ...p, assignedTo: e.target.value }))}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 outline-none"
                    >
                      <option value="">Select department</option>
                      <option>Exam Cell</option>
                      <option>Academic Section</option>
                      <option>Maintenance</option>
                      <option>Dean's Office</option>
                      <option>Hostel Administration</option>
                      <option>Placement Cell</option>
                      <option>Library</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={assignForm.deadline}
                      onChange={(e) => setAssignForm((p) => ({ ...p, deadline: e.target.value }))}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition disabled:opacity-60"
                  >
                    {assigning ? 'Saving...' : 'Save Assignment'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Student view — just info */
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Issue Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <IconClock size={14} className="text-gray-400" />
                  <div>
                    <div className="text-[10px] text-gray-400">Current status</div>
                    <Badge variant={statusVariant[grievance.status]} className="mt-0.5">
                      {grievance.status}
                    </Badge>
                  </div>
                </div>
                {grievance.assignedTo && (
                  <div className="flex items-center gap-2">
                    <IconBuilding size={14} className="text-gray-400" />
                    <div>
                      <div className="text-[10px] text-gray-400">Assigned to</div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                        {grievance.assignedTo}
                      </div>
                    </div>
                  </div>
                )}
                {grievance.deadline && (
                  <div className="flex items-center gap-2">
                    <IconCalendar size={14} className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
                    <div>
                      <div className="text-[10px] text-gray-400">Expected by</div>
                      <div className={`text-xs font-medium mt-0.5 ${
                        isOverdue ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {new Date(grievance.deadline).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default GrievanceDetailPage;