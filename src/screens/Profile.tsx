import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, LogOut, Edit, Plus } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import { useAuthContext } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface UserAddress {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: UserAddress[];
}

const Profile: React.FC = () => {
  const { user, isAdmin } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Fetch user addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user?.id);

      if (addressesError) throw addressesError;

      setUserProfile({
        ...profileData,
        addresses: addressesData || []
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile data');
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <AnimatedContainer>
        <div className="py-4 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
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

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-krosh-lavender/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-krosh-text" />
            </div>
            <h2 className="text-xl font-semibold">{userProfile?.name || user.email}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {isAdmin && (
              <span className="inline-block mt-2 px-3 py-1 bg-krosh-pink/20 rounded-full text-sm">
                Admin
              </span>
            )}
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{userProfile?.phone || 'Not provided'}</p>
              </div>
              <button className="ml-auto text-krosh-lavender">
                <Edit size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Saved Addresses</h3>
            <button className="text-sm text-krosh-lavender flex items-center gap-1">
              <Plus size={16} />
              <span>Add New</span>
            </button>
          </div>

          {userProfile?.addresses && userProfile.addresses.length > 0 ? (
            <div className="space-y-4">
              {userProfile.addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-3 relative">
                  {address.is_default && (
                    <span className="absolute top-2 right-2 bg-krosh-lavender/20 text-krosh-text text-xs px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                  <p className="font-medium">{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-xs text-krosh-lavender">Edit</button>
                    <button className="text-xs text-red-500">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <MapPin size={24} className="mx-auto mb-2 text-gray-400" />
              <p>No addresses saved yet</p>
              <p className="text-sm">Add an address to make checkout faster</p>
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          <Link to="/orders" className="text-krosh-lavender text-sm flex justify-center">
            View All Orders
          </Link>
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Profile;