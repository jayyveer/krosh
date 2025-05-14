import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signIn } from '../lib/auth';
import { useAuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  // If user is already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await signIn(email, password);
      // Show success toast
      showToast(`Welcome back${user?.user_metadata?.name ? ', ' + user.user_metadata.name : ''}!`, 'success');
      // Redirect will happen automatically due to the useEffect
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.message === 'ACCOUNT_DISABLED') {
        setError(
          'Your account has been disabled. Please contact kroshenquiry@gmail.com for assistance.'
        );
      } else {
        setError('Invalid email or password');
      }
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
            Welcome Back
          </h1>
          <p className="text-white/90 text-lg">Sign in to your account</p>
        </div>

        <div className="bg-white/85 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/30 bg-gradient-to-br from-white/95 to-white/75">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
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
                  className="w-full py-2 pl-10 pr-3 bg-white/80 backdrop-blur-[2px] border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-krosh-lavender/50 focus:bg-white/90"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end mb-2">
              <Link
                to="/forgot-password"
                className="text-sm text-krosh-buttonPrimary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-krosh-lavender to-krosh-pink text-white py-3 rounded-lg font-medium text-lg shadow-lg disabled:opacity-70 hover:opacity-90 transition-opacity"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </motion.button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-base text-white">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-medium hover:underline">
              Sign Up
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

export default Login;
