import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, LogOut } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import { useAuthContext } from '../contexts/AuthContext';
import { signIn, signOut } from '../lib/auth';

const Profile: React.FC = () => {
  const { user, isAdmin } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      setError('Error logging out');
    }
  };

  if (user) {
    return (
      <AnimatedContainer>
        <div className="py-4 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-krosh-lavender/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} className="text-krosh-text" />
              </div>
              <h2 className="text-xl font-semibold">{user.email}</h2>
              {isAdmin && (
                <span className="inline-block mt-2 px-3 py-1 bg-krosh-pink/20 rounded-full text-sm">
                  Admin
                </span>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer>
      <div className="py-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-krosh-lavender/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-krosh-text" />
            </div>
            <p className="text-gray-500 text-sm">Please log in to view your profile</p>
          </div>
          
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
            </div>
            
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-krosh-lavender to-krosh-pink py-2 rounded-lg text-white font-medium disabled:opacity-70"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Profile;