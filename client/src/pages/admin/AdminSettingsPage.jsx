import AppShell from '../../components/layout/AppShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import {
  IconShieldCheck, IconKey, IconBell,
  IconPalette, IconSchool,
} from '@tabler/icons-react';

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await axiosInstance.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Settings">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Admin Settings
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Manage your account and platform preferences
          </p>
        </div>

        {/* Admin info card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-lg font-semibold text-indigo-700 dark:text-indigo-300">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {user?.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                {user?.email}
              </div>
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                <IconShieldCheck size={10} /> Admin
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Department</div>
              <div className="text-gray-700 dark:text-gray-300">{user?.department}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">Role</div>
              <div className="text-gray-700 dark:text-gray-300">{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <IconKey size={16} className="text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Change Password
            </h3>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Platform info */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <IconSchool size={16} className="text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Platform Info
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
              <span className="text-gray-600 dark:text-slate-400">Platform</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium">CampusGrieve v1.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
              <span className="text-gray-600 dark:text-slate-400">University</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium">Vinoba Bhave University</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-slate-400">Developer</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium">Rohit Kumar Guin</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AdminSettingsPage;