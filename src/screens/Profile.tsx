import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, LogOut, Edit, Plus, Package, ChevronRight, UserCircle } from 'lucide-react';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import SectionHeader from '../components/ui/SectionHeader';
import { useAuthContext } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AddressList from '../components/address/AddressList';
import { Address } from '../components/address/AddressForm';
import PhoneNumberForm from '../components/profile/PhoneNumberForm';
import { useToast } from '../contexts/ToastContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Tabs for the profile page
type ProfileTab = 'info' | 'addresses' | 'orders';

const Profile: React.FC = () => {
  const { user, isAdmin } = useAuthContext();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Fetch user addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (addressesError) throw addressesError;

      setUserProfile(profileData);
      setAddresses(addressesData || []);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = () => {
    fetchUserProfile();
  };

  const handlePhoneUpdate = (phone: string) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        phone
      });
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
          <SectionHeader title="Profile" showBackButton={false} />
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
        <SectionHeader title="Profile" showBackButton={false} />

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Profile Header */}
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

          {/* Tab Navigation */}
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'text-krosh-lavender border-b-2 border-krosh-lavender'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'addresses'
                  ? 'text-krosh-lavender border-b-2 border-krosh-lavender'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Addresses
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'text-krosh-lavender border-b-2 border-krosh-lavender'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Personal Info Tab */}
          {activeTab === 'info' && (
            <>
              {showPhoneForm ? (
                <PhoneNumberForm
                  currentPhone={userProfile?.phone || ''}
                  userId={user.id}
                  onClose={() => setShowPhoneForm(false)}
                  onSave={handlePhoneUpdate}
                />
              ) : (
                <div className="space-y-4">
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
                    <button
                      onClick={() => setShowPhoneForm(true)}
                      className="ml-auto text-krosh-lavender"
                      aria-label="Edit phone number"
                    >
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <UserCircle size={18} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{userProfile?.name || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4 mt-4 border-t">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <AddressList
              addresses={addresses}
              onAddressChange={handleAddressChange}
            />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <Link
                to="/orders"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-krosh-lavender/20 rounded-full flex items-center justify-center">
                    <Package size={20} className="text-krosh-lavender" />
                  </div>
                  <div>
                    <p className="font-medium">Track Orders</p>
                    <p className="text-sm text-gray-500">View and track your orders</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Profile;