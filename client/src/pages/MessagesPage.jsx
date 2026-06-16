import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import { fetchMessages, sendMessage } from '../api/message.api.js';
import { fetchGrievanceById } from '../api/grievance.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { IconArrowLeft, IconSend } from '@tabler/icons-react';

const MessagesPage = () => {
  const { grievanceId } = useParams();
  const navigate        = useNavigate();
  const { user, isAdmin } = useAuth();
  const bottomRef       = useRef(null);

  const [grievance, setGrievance] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);

  useEffect(() => {
    loadData();
  }, [grievanceId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [grievanceData, messagesData] = await Promise.all([
        fetchGrievanceById(grievanceId),
        fetchMessages(grievanceId),
      ]);
      setGrievance(grievanceData.grievance);
      setMessages(messagesData.messages);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Determine receiver
    // If student is sending → send to first assigned admin
    // If admin is sending → send to the student who submitted
    let receiverId;
    if (isAdmin) {
      receiverId = grievance?.submittedBy?._id || grievance?.submittedBy;
    } else {
      receiverId = grievance?.assignedAdmins?.[0]?._id ||
                   grievance?.assignedAdmins?.[0];
    }

    if (!receiverId) {
      return toast.error('No recipient found for this grievance');
    }

    setSending(true);
    try {
      const data = await sendMessage(grievanceId, text, receiverId);
      setMessages((prev) => [...prev, data.message]);
      setText('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Private Messages">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Private Messages">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition"
      >
        <IconArrowLeft size={16} />
        Back
      </button>

      {/* Grievance info header */}
      {grievance && (
        <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {grievance.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Private conversation · {isAdmin
                  ? `with ${grievance.submittedBy?.name}`
                  : `with assigned admins`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages container */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-3xl mb-2">💬</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  No messages yet
                </div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  Start the private conversation below
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id ||
                           msg.sender?.toString() === user?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {/* Sender name */}
                    <div className={`text-[10px] font-medium px-1 ${
                      isMe
                        ? 'text-indigo-600 dark:text-indigo-400 text-right'
                        : 'text-gray-500 dark:text-slate-400'
                    }`}>
                      {msg.sender?.name}
                      {msg.sender?.role === 'Admin' && (
                        <span className="ml-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full text-[9px]">
                          Admin
                        </span>
                      )}
                    </div>
                    {/* Message bubble */}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                    }`}>
                      {msg.text}
                    </div>
                    {/* Time */}
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 px-1">
                      {new Date(msg.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Message input */}
        <div className="border-t border-gray-100 dark:border-slate-800 p-3">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a private message..."
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center"
            >
              {sending
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <IconSend size={16} />
              }
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
};

export default MessagesPage;