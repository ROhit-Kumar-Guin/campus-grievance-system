import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import { fetchStories, toggleLike, addComment, deleteStory, createStory } from '../api/story.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import toast from 'react-hot-toast';
import {
  IconHeart, IconHeartFilled, IconMessage,
  IconTrash, IconPlus, IconX, IconUpload,
} from '@tabler/icons-react';

const categoryColors = {
  Achievement: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
  Event: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  Placement: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
  Announcement: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300',
  Other: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400',
};

const categoryEmoji = {
  Achievement: '🏆', Event: '📅',
  Placement: '💼', Announcement: '📢', Other: '📌',
};

// ── Create Story Modal ───────────────────────────────────────
const CreateStoryModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '', content: '', category: 'Announcement',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      return toast.error('Title and content are required');
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('category', formData.category);
      if (image) data.append('image', image);

      await createStory(data);
      toast.success('Story posted!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Post a Story</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
            <IconX size={16} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
              Title *
            </label>
            <input
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="Story title"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Achievement</option>
              <option>Event</option>
              <option>Placement</option>
              <option>Announcement</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              rows={4}
              placeholder="Write your story..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
          </div>

          {/* Image upload */}
          <div
            onClick={() => document.getElementById('story-image').click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${image
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950'
                : 'border-gray-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
          >
            <input
              id="story-image"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
            {image ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                ✓ {image.name}
              </p>
            ) : (
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <IconUpload size={16} />
                <span className="text-sm">Add image (optional)</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? 'Posting...' : 'Post Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Story Card ───────────────────────────────────────────────
const StoryCard = ({ story, currentUserId, isAdmin, onLike, onDelete, onView }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(story.comments || []);
  const [likesCount, setLikesCount] = useState(story.likes?.length || 0);
  const [liked, setLiked] = useState(
    story.likes?.some((id) => id === currentUserId || id?._id === currentUserId)
  );

  const handleLike = async () => {
    try {
      const data = await toggleLike(story._id);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch {
      toast.error('Failed to like');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const data = await addComment(story._id, commentText);
      setComments((prev) => [...prev, data.comment]);
      setCommentText('');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Story image */}
      {story.imageUrl && (
        <img
          src={story.imageUrl}
          alt={story.title}
          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
          onClick={onView}
        />
      )}

      {/* Card body */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {story.author?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {story.author?.name}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-slate-500">
                {new Date(story.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[story.category]}`}>
              {categoryEmoji[story.category]} {story.category}
            </span>
            {isAdmin && (
              <button
                onClick={() => onDelete(story._id)}
                className="p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
              >
                <IconTrash size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Title + content */}
        <h3
          className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
          onClick={onView}
        >
          {story.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          {story.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition ${liked
                ? 'text-red-500'
                : 'text-gray-400 dark:text-slate-500 hover:text-red-500'
              }`}
          >
            {liked
              ? <IconHeartFilled size={16} />
              : <IconHeart size={16} />
            }
            <span className="text-xs">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments((p) => !p)}
            className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <IconMessage size={16} />
            <span className="text-xs">{comments.length}</span>
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4">
            {/* Comment list */}
            {comments.length > 0 && (
              <div className="space-y-2 mb-3">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                      {c.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 flex-1">
                      <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                        {c.user?.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition disabled:opacity-50"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Full story viewer modal with prev/next navigation
const StoryViewer = ({ stories, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const story = stories[current];

  const goNext = () => { if (current < stories.length - 1) setCurrent((p) => p + 1); };
  const goPrev = () => { if (current > 0) setCurrent((p) => p - 1); };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
      >
        <IconX size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs">
        {current + 1} / {stories.length}
      </div>

      {/* Progress bars */}
      <div className="absolute top-12 left-4 right-4 flex gap-1">
        {stories.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full ${i < current ? 'bg-white' :
                i === current ? 'bg-white/80' : 'bg-white/30'
              }`}
          />
        ))}
      </div>

      {/* Prev button */}
      {current > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
        >
          ‹
        </button>
      )}

      {/* Story content */}
      <div className="max-w-lg w-full bg-[#1a1a2e] rounded-2xl overflow-hidden">
        {story.imageUrl && (
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full max-h-80 object-cover"
          />
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
              {story.author?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{story.author?.name}</div>
              <div className="text-[10px] text-white/50">
                {new Date(story.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </div>
            </div>
            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[story.category]}`}>
              {categoryEmoji[story.category]} {story.category}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white mb-2">{story.title}</h3>
          <p className="text-sm text-white/70 leading-relaxed">{story.content}</p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
            <span className="text-white/50 text-xs">❤️ {story.likes?.length || 0} likes</span>
            <span className="text-white/50 text-xs">💬 {story.comments?.length || 0} comments</span>
          </div>
        </div>
      </div>

      {/* Next button */}
      {current < stories.length - 1 && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
        >
          ›
        </button>
      )}
    </div>
  );
};

// ── Main Stories Page ────────────────────────────────────────
const StoriesPage = () => {
  const { user, isAdmin } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('');
  const [viewerIndex, setViewerIndex] = useState(null);

  useEffect(() => {
    loadStories();
  }, [filter]);

  const loadStories = async () => {
    setLoading(true);
    try {
      const params = filter ? { category: filter } : {};
      const data = await fetchStories(params);
      setStories(data.stories);
    } catch {
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await deleteStory(id);
      setStories((prev) => prev.filter((s) => s._id !== id));
      toast.success('Story deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <AppShell title="Stories & Events">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Stories & Events
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Campus achievements, events and announcements
          </p>
        </div>
        
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
          >
            <IconPlus size={15} />
            Post Story
          </button>
        
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {['', 'Achievement', 'Event', 'Placement', 'Announcement', 'Other'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
          >
            {cat === '' ? 'All' : `${categoryEmoji[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {/* Stories grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          icon="📰"
          title="No stories yet"
          description={isAdmin
            ? 'Post the first story using the button above.'
            : 'No stories or events posted yet.'
          }
          action={isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Post first story
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((story, index) => (
            <StoryCard
              key={story._id}
              story={story}
              currentUserId={user?._id}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onView={() => setViewerIndex(index)}
            />
          ))}
        </div>
      )}
      {viewerIndex !== null && (
  <StoryViewer
    stories={stories}
    startIndex={viewerIndex}
    onClose={() => setViewerIndex(null)}
  />
)}

      {/* Create modal */}
      {showCreate && (
        <CreateStoryModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            loadStories();
          }}
        />
      )}
    </AppShell>
    
  );
};

export default StoriesPage;