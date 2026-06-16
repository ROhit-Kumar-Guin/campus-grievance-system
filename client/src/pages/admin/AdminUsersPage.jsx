import { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import axiosInstance from '../../api/axiosInstance.js';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import toast from 'react-hot-toast';
import { IconSearch, IconShieldCheck, IconUser, IconTrash } from '@tabler/icons-react';

const AdminUsersPage = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/auth/users');
      setUsers(res.data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user ${name}? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/auth/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filter === '' || u.role === filter;
    return matchSearch && matchRole;
  });

  return (
    <AppShell title="Users">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            All Users
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {users.length} registered users
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-sm">
          <IconSearch size={13} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-transparent text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 outline-none"
        >
          <option value="">All roles</option>
          <option value="Student">Students</option>
          <option value="Admin">Admins</option>
        </select>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50 dark:bg-slate-800/50 text-xs font-medium text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800">
          <span className="col-span-4">User</span>
          <span className="col-span-4">Department</span>
          <span className="col-span-2">Role</span>
          <span className="col-span-1">Joined</span>
          <span className="col-span-1"></span>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No users found"
            description="No users match your search."
          />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {filtered.map((u) => (
              <div
                key={u._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                {/* Name + email */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    u.role === 'Admin'
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                  }`}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {u.name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 truncate">
                      {u.email}
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div className="col-span-4">
                  <span className="text-xs text-gray-600 dark:text-slate-400 truncate">
                    {u.department}
                  </span>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === 'Admin'
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                  }`}>
                    {u.role === 'Admin'
                      ? <IconShieldCheck size={10} />
                      : <IconUser size={10} />
                    }
                    {u.role}
                  </span>
                </div>

                {/* Joined date */}
                <div className="col-span-1">
                  <span className="text-xs text-gray-400 dark:text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short',
                    })}
                  </span>
                </div>

                {/* Delete */}
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleDelete(u._id, u.name)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AdminUsersPage;