import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../lib/auth';
import { useAuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters
    return password.length >= 8;
  };

  const handleRegister = async (e: React.FormEvent) => {
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
      const { user, session } = await signUp(email, password, name);

      if (user) {
        showToast(`Welcome to Yarn by Krosh, ${name}!`, 'success');

        // If we got a session, the user is already logged in
        if (session) {
          navigate('/');
        } else {
          // Otherwise, redirect to login
          navigate('/login');
        }
      } else {
        // This should rarely happen
        showToast('Registration successful!', 'success');
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);

      if (err.message.includes('already registered')) {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (err.code === '42501' || err.message.includes('violates row-level security policy')) {
        // This is the RLS policy error
        setError('There was an issue creating your account. Please try again later or contact support.');
        console.error('RLS policy error during signup. Please check your Supabase RLS policies.');
      } else {
        setError(err.message || 'Failed to register. Please try again.');
      }
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
            Create Account
          </h1>
          <p className="text-gray-600 mt-2">Join Yarn by Krosh today</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-krosh-lavender/50"
                  required
                />
              </div>
            </div>

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
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-krosh-lavender/50"
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
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-krosh-lavender/50"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
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

export default Register;
