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
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/background.jpg"
          alt="Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Background image failed to load');
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Gradient overlay that's more elegant */}
        <div className="absolute inset-0 bg-gradient-to-br from-krosh-lavender/70 via-black/50 to-krosh-pink/60"></div>
      </div>

      <motion.div
        className="w-full max-w-md z-10 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="h-28 w-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-xl">
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
          <h1 className="text-4xl font-bold text-white mb-2">
            Reset Password
          </h1>
          <p className="text-white/90 text-lg">We'll send you a link to reset your password</p>
        </div>

        <div className="bg-white/85 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/30 bg-gradient-to-br from-white/95 to-white/75">
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
                className="mt-4 w-full bg-gradient-to-r from-krosh-lavender to-krosh-pink text-white py-3 rounded-lg font-medium text-lg shadow-lg hover:opacity-90 transition-opacity"
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
                    className="w-full py-2 pl-10 pr-3 bg-white/80 backdrop-blur-[2px] border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-krosh-lavender/50 focus:bg-white/90"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-krosh-lavender to-krosh-pink text-white py-3 rounded-lg font-medium text-lg shadow-lg disabled:opacity-70 hover:opacity-90 transition-opacity"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-base text-white">
            Remember your password?{' '}
            <Link to="/login" className="text-white font-medium hover:underline">
              Log In
            </Link>
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-white/80 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm"
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
