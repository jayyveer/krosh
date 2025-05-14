import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../lib/auth';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validResetLink, setValidResetLink] = useState(true);

  // Check if the user has a valid reset token
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        setValidResetLink(false);
        setError('Invalid or expired password reset link. Please request a new one.');
      }
    };
    
    checkSession();
  }, []);

  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters
    return password.length >= 8;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      showToast('Password has been reset successfully!', 'success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-krosh-background p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden border-2 border-krosh-lavender/30 shadow-sm">
              <img
                src="/images/yarn-by-krosh.jpeg"
                alt="Yarn by Krosh Logo"
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.error('Logo failed to load');
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-krosh-text">
            Set New Password
          </h1>
          <p className="text-gray-600 mt-2">Create a new password for your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {!validResetLink ? (
            <div className="text-center py-4">
              <div className="mb-4 text-red-600 bg-red-50 p-4 rounded-lg">
                <p className="font-medium">Invalid Reset Link</p>
                <p className="text-sm mt-1">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <button
                onClick={() => navigate('/forgot-password')}
                className="mt-4 w-full bg-krosh-buttonPrimary text-white py-2 rounded-lg font-medium shadow-md"
              >
                Request New Reset Link
              </button>
            </div>
          ) : success ? (
            <div className="text-center py-4">
              <div className="mb-4 text-green-600 bg-green-50 p-4 rounded-lg">
                <p className="font-medium">Password Reset Successful!</p>
                <p className="text-sm mt-1">
                  Your password has been reset successfully. You will be redirected to the login page.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 w-full bg-krosh-buttonSecondary text-white py-2 rounded-lg font-medium shadow-md"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-krosh-lavender/50"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-krosh-lavender/50"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-krosh-buttonPrimary text-white py-2 rounded-lg font-medium shadow-md disabled:opacity-70"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Updating Password...' : 'Set New Password'}
                </motion.button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
