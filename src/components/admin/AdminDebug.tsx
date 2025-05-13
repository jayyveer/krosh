import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { checkAdminStatus, syncUserData } from '../../lib/api';
import { supabase } from '../../lib/supabase';

const AdminDebug: React.FC = () => {
  const { user } = useAuthContext();
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkAdmin();
    }
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const status = await checkAdminStatus(user.id);
      setAdminStatus(status);
    } catch (err) {
      console.error('Error checking admin status:', err);
      setError('Failed to check admin status');
    } finally {
      setLoading(false);
    }
  };

  const syncUser = async () => {
    if (!user || !user.email) return;
    
    setLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      const result = await syncUserData(user.id, user.email);
      setMessage(result.message);
      // Refresh admin status
      await checkAdmin();
    } catch (err) {
      console.error('Error syncing user data:', err);
      setError('Failed to sync user data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-red-600">Not logged in</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Admin Authentication Debug</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4">
          {message}
        </div>
      )}
      
      <div className="space-y-4 mb-6">
        <div>
          <p className="font-medium">Auth User ID:</p>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded">{user.id}</p>
        </div>
        
        <div>
          <p className="font-medium">Auth User Email:</p>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded">{user.email}</p>
        </div>
        
        <div>
          <p className="font-medium">Admin Status:</p>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
            {loading ? 'Checking...' : 
             adminStatus ? JSON.stringify(adminStatus, null, 2) : 'Not checked'}
          </p>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={checkAdmin}
          disabled={loading}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
        >
          Refresh Status
        </button>
        
        <button
          onClick={syncUser}
          disabled={loading}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
        >
          Sync User Data
        </button>
      </div>
    </div>
  );
};

export default AdminDebug;
