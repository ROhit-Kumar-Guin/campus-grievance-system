import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep]           = useState(1); // 1=email, 2=otp+password
  const [email, setEmail]         = useState('');
  const [otp, setOtp]             = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto focus next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Go back on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 4) return toast.error('Please enter the 4-digit OTP');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', {
        email,
        otp: otpString,
        newPassword,
      });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 mb-4">
            <span className="text-white text-lg">🎓</span>
            <span className="text-white font-medium text-sm">CampusGrieve</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-transparent dark:border-slate-800">
          {/* Header */}
          <div className="bg-indigo-50 dark:bg-indigo-950/50 px-6 pt-6 pb-5 text-center">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔓</span>
            </div>
            <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
              Reset password
            </h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
              {step === 1
                ? "We'll send an OTP to your email"
                : `OTP sent to ${email}`
              }
            </p>
          </div>

          <div className="p-6">
            {step === 1 ? (
              /* Step 1 — Email */
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                    University Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rollno@vbu.ac.in"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Send OTP'}
                </button>
              </form>
            ) : (
              /* Step 2 — OTP + New Password */
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* OTP inputs */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-3 text-center">
                    Enter 4-digit OTP
                  </label>
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                      />
                    ))}
                  </div>
                  <p
                    className="text-xs text-center text-indigo-600 dark:text-indigo-400 mt-3 cursor-pointer hover:underline"
                    onClick={() => { setStep(1); setOtp(['', '', '', '']); }}
                  >
                    Resend OTP
                  </p>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Reset Password'}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-gray-500 dark:text-slate-500 mt-4">
              Remember your password?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;