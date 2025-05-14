import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../lib/auth';
import { useToast } from '../contexts/ToastContext';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      showToast('Password reset email sent. Please check your inbox.', 'success');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
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
            Reset Password
          </h1>
          <p className="text-gray-600 mt-2">We'll send you a link to reset your password</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="mb-4 text-green-600 bg-green-50 p-4 rounded-lg">
                <p className="font-medium">Reset link sent!</p>
                <p className="text-sm mt-1">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your email and follow the instructions.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 w-full bg-krosh-buttonSecondary text-white py-2 rounded-lg font-medium shadow-md"
              >
                Return to Login
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-krosh-buttonPrimary font-medium hover:underline">
              Log In
            </Link>
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-krosh-lavender transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
