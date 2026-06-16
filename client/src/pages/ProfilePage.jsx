import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { IconUser, IconKey, IconTrash, IconArrowLeft } from '@tabler/icons-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Information Technology',
  'Other',
];

const ProfilePage = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name:       user?.name       || '',
    department: user?.department || '',
    rollNumber: user?.rollNumber || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  const [profileLoading,  setProfileLoading]  = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading,   setDeleteLoading]   = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await axiosInstance.patch('/auth/update-profile', profileForm);
      toast.success('Profile updated successfully');
      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setPasswordLoading(true);
    try {
      await axiosInstance.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your grievances will be removed.'
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await axiosInstance.delete('/auth/delete-account');
      toast.success('Account deleted');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AppShell title="My Profile">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-5 transition"
        >
          <IconArrowLeft size={16} />
          Back to dashboard
        </button>

        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            My Profile
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Manage your account information
          </p>
        </div>

        {/* Profile hero */}
        <div className="bg-indigo-600 rounded-xl p-5 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold text-white border-2 border-white/40">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold text-base">{user?.name}</div>
            <div className="text-indigo-200 text-xs mt-0.5">{user?.email}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">
                {user?.department?.split(' ')[0]}
              </span>
              {user?.rollNumber && (
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {user?.rollNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Update profile form */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <IconUser size={16} className="text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Personal Information
            </h3>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Department
              </label>
              <select
                value={profileForm.department}
                onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Roll Number
              </label>
              <input
                value={profileForm.rollNumber}
                onChange={(e) => setProfileForm((p) => ({ ...p, rollNumber: e.target.value }))}
                placeholder="e.g. 22BCSE045"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Email
              </label>
              <input
                value={user?.email}
                disabled
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-sm text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
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
              disabled={passwordLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/50 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <IconTrash size={16} className="text-red-500" />
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
              Danger Zone
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Permanently delete your account and all associated data including grievances and comments. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="w-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {deleteLoading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default ProfilePage;