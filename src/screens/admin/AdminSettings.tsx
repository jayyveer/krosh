import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import {
  Store,
  Users,
  Database,
  Mail,
  CreditCard,
  Truck,
  Save,
  AlertCircle,
  UserPlus,
  Shield
} from 'lucide-react';

interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency: string;
  shipping_fee: number;
  free_shipping_threshold: number;
  tax_rate: number;
  enable_cod: boolean;
  enable_online_payment: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'editor';
  created_at: string;
}

const AdminSettings: React.FC = () => {
  const { adminRole } = useAuthContext();
  const { showToast } = useToast();

  // Settings state
  const [activeTab, setActiveTab] = useState<'store' | 'admins' | 'storage'>('store');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    store_name: 'Krosh',
    store_email: 'kroshenquiry@gmail.com',
    store_phone: '',
    store_address: '',
    currency: 'INR',
    shipping_fee: 0,
    free_shipping_threshold: 0,
    tax_rate: 0,
    enable_cod: true,
    enable_online_payment: false
  });

  // Admin users
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'editor' | 'superadmin'>('editor');

  // Storage stats
  const [storageStats, setStorageStats] = useState({
    total_size: 0,
    file_count: 0,
    buckets: []
  });

  // Only superadmins should be able to access this page
  if (adminRole !== 'superadmin') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <AlertCircle className="inline-block mr-2" size={20} />
          You don't have permission to access this page. Only superadmins can access settings.
        </div>
      </div>
    );
  }

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
    fetchAdminUsers();
    fetchStorageStats();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Check if settings table exists
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, which is expected if no settings exist yet
        console.error('Error fetching settings:', error);
        setError('Failed to load settings');
      } else if (data) {
        setStoreSettings(data);
      }
    } catch (err) {
      console.error('Error in fetchSettings:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAdminUsers(data || []);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    }
  };

  const fetchStorageStats = async () => {
    try {
      // This is a placeholder - in a real implementation, you would
      // fetch actual storage stats from Supabase or your backend
      setStorageStats({
        total_size: 25600000, // 25.6 MB
        file_count: 42,
        buckets: [
          { name: 'shop-images', size: 24000000, files: 40 },
          { name: 'avatars', size: 1600000, files: 2 }
        ]
      });
    } catch (err) {
      console.error('Error fetching storage stats:', err);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // Check if settings exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('store_settings')
        .select('id')
        .single();

      let result;

      if (checkError && checkError.code === 'PGRST116') {
        // No settings exist, insert new row
        result = await supabase
          .from('store_settings')
          .insert([storeSettings]);
      } else {
        // Update existing settings
        result = await supabase
          .from('store_settings')
          .update(storeSettings)
          .eq('id', existingSettings.id);
      }

      if (result.error) throw result.error;

      showToast('Settings saved successfully', 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addAdminUser = async () => {
    if (!newAdminEmail.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    try {
      setSaving(true);

      // First check if the user exists in auth
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_id_by_email', { email_input: newAdminEmail.trim() });

      if (userError) throw userError;

      if (!userData) {
        showToast('User not found. They must sign up first.', 'error');
        return;
      }

      // Check if already an admin
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from('admins')
        .select('id')
        .eq('id', userData)
        .single();

      if (existingAdmin) {
        showToast('This user is already an admin', 'error');
        return;
      }

      // Add to admins table
      const { error: insertError } = await supabase
        .from('admins')
        .insert([{
          id: userData,
          email: newAdminEmail.trim(),
          role: newAdminRole
        }]);

      if (insertError) throw insertError;

      showToast(`Admin user added successfully`, 'success');
      setNewAdminEmail('');
      fetchAdminUsers();
    } catch (err) {
      console.error('Error adding admin user:', err);
      showToast('Failed to add admin user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateAdminRole = async (adminId: string, newRole: 'superadmin' | 'editor') => {
    try {
      const { error } = await supabase
        .from('admins')
        .update({ role: newRole })
        .eq('id', adminId);

      if (error) throw error;

      showToast('Admin role updated successfully', 'success');
      fetchAdminUsers();
    } catch (err) {
      console.error('Error updating admin role:', err);
      showToast('Failed to update admin role', 'error');
    }
  };

  const removeAdmin = async (adminId: string) => {
    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      showToast('Admin removed successfully', 'success');
      fetchAdminUsers();
    } catch (err) {
      console.error('Error removing admin:', err);
      showToast('Failed to remove admin', 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
          <button
            className="ml-auto text-red-800 font-medium"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'store'
              ? 'text-krosh-lavender border-b-2 border-krosh-lavender'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Store size={16} className="inline-block mr-2" />
          Store Settings
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'admins'
              ? 'text-krosh-lavender border-b-2 border-krosh-lavender'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={16} className="inline-block mr-2" />
          Admin Users
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'storage'
              ? 'text-krosh-lavender border-b-2 border-krosh-lavender'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Database size={16} className="inline-block mr-2" />
          Storage
        </button>
      </div>

      {/* Store Settings Tab */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Store Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={storeSettings.store_name}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, store_name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={storeSettings.currency}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail size={16} className="inline-block mr-1" />
                Contact Email
              </label>
              <input
                type="email"
                value={storeSettings.store_email}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, store_email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={storeSettings.store_phone}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, store_phone: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Address
              </label>
              <textarea
                value={storeSettings.store_address}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, store_address: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">
            <Truck size={18} className="inline-block mr-2" />
            Shipping Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={storeSettings.shipping_fee}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, shipping_fee: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={storeSettings.free_shipping_threshold}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, free_shipping_threshold: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Set to 0 to disable free shipping</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">
            <CreditCard size={18} className="inline-block mr-2" />
            Payment Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={storeSettings.enable_cod}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, enable_cod: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Enable Cash on Delivery</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={storeSettings.enable_online_payment}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, enable_online_payment: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Enable Online Payment</span>
              </label>
              {storeSettings.enable_online_payment && (
                <p className="text-xs text-gray-500 mt-1">
                  Note: Additional payment gateway configuration is required
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={storeSettings.tax_rate}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving || loading}
              className="px-4 py-2 bg-krosh-lavender text-white rounded-lg hover:bg-krosh-lavender/80 flex items-center"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Admin Users Tab */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Admin Users</h2>

          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Add New Admin</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 px-3 py-2 border rounded-lg"
              />

              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as 'editor' | 'superadmin')}
                className="md:w-40 px-3 py-2 border rounded-lg"
              >
                <option value="editor">Editor</option>
                <option value="superadmin">Superadmin</option>
              </select>

              <button
                onClick={addAdminUser}
                disabled={saving}
                className="px-4 py-2 bg-krosh-lavender text-white rounded-lg hover:bg-krosh-lavender/80 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} className="mr-2" />
                    Add Admin
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Note: The user must already have an account before they can be made an admin
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminUsers.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {admin.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.role === 'superadmin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <Shield size={12} className="mr-1" />
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        {admin.role === 'editor' ? (
                          <button
                            onClick={() => updateAdminRole(admin.id, 'superadmin')}
                            className="text-xs text-purple-600 hover:text-purple-800"
                          >
                            Make Superadmin
                          </button>
                        ) : (
                          <button
                            onClick={() => updateAdminRole(admin.id, 'editor')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Make Editor
                          </button>
                        )}

                        <button
                          onClick={() => removeAdmin(admin.id)}
                          className="text-xs text-red-600 hover:text-red-800 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {adminUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                      No admin users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Storage Management</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-1">Total Storage Used</h3>
              <p className="text-2xl font-bold">{formatBytes(storageStats.total_size)}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-1">Total Files</h3>
              <p className="text-2xl font-bold">{storageStats.file_count}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-1">Buckets</h3>
              <p className="text-2xl font-bold">{storageStats.buckets.length}</p>
            </div>
          </div>

          <h3 className="font-medium mb-2">Storage Buckets</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bucket Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {storageStats.buckets.map((bucket: any) => (
                  <tr key={bucket.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {bucket.name}
                    </td>
                    <td className="px-4 py-3">
                      {formatBytes(bucket.size)}
                    </td>
                    <td className="px-4 py-3">
                      {bucket.files}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Note: Storage management is handled through the Supabase dashboard.
              This page provides a read-only view of your storage usage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
