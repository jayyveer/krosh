import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { checkAdminStatus, syncUserData } from '../lib/api';
import { supabase } from '../lib/supabase';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import { syncAdminStatus, forceAdminReload } from '../lib/adminSync';

const AdminDebugPage: React.FC = () => {
  const { user, isAdmin: contextIsAdmin, adminRole } = useAuthContext();
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [directCheck, setDirectCheck] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkAdmin();
      checkDirectAdmin();
    }
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const status = await checkAdminStatus(user.id);
      setAdminStatus(status);
      console.log('Admin status check result:', status);
    } catch (err) {
      console.error('Error checking admin status:', err);
      // More detailed error message
      if (err instanceof Error) {
        setError('Failed to check admin status: ' + err.message);
      } else if (typeof err === 'object' && err !== null) {
        setError('Failed to check admin status: ' + JSON.stringify(err));
      } else {
        setError('Failed to check admin status: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkDirectAdmin = async () => {
    if (!user) return;

    try {
      // Direct check in the database
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single();

      setDirectCheck({ data, error });
      console.log('Direct admin check result:', { data, error });

      // Also try a direct SQL query
      try {
        const { data: sqlData, error: sqlError } = await supabase.rpc('is_user_admin', {
          user_id: user.id
        });

        console.log('SQL admin check result:', { data: sqlData, error: sqlError });
      } catch (sqlErr) {
        console.error('Error with SQL admin check:', sqlErr);
      }
    } catch (err) {
      console.error('Error with direct admin check:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
      } else {
        console.error('Error details:', err);
      }
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
      await checkDirectAdmin();
    } catch (err) {
      console.error('Error syncing user data:', err);
      setError('Failed to sync user data');
    } finally {
      setLoading(false);
    }
  };

  const syncAdmin = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await syncAdminStatus(user.id);

      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }

      // Refresh admin status
      await checkAdmin();
      await checkDirectAdmin();
    } catch (err) {
      console.error('Error syncing admin status:', err);
      if (err instanceof Error) {
        setError('Failed to sync admin status: ' + err.message);
      } else {
        setError('Failed to sync admin status');
      }
    } finally {
      setLoading(false);
    }
  };

  const reloadPage = () => {
    forceAdminReload();
  };

  const makeAdmin = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Use the make_user_admin function
      const { data, error } = await supabase
        .rpc('make_user_admin', {
          user_id: user.id,
          user_email: user.email,
          admin_role: 'superadmin'
        });

      if (error) throw error;

      if (data.success) {
        setMessage(data.message);
      } else {
        setError(data.message);
      }

      // Refresh admin status
      await checkAdmin();
      await checkDirectAdmin();
    } catch (err) {
      console.error('Error making user admin:', err);
      // More detailed error message
      if (err instanceof Error) {
        setError('Failed to make user admin: ' + err.message);
      } else if (typeof err === 'object' && err !== null) {
        setError('Failed to make user admin: ' + JSON.stringify(err));
      } else {
        setError('Failed to make user admin: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <AnimatedContainer>
        <div className="py-4">
          <h1 className="text-2xl font-bold mb-6">Admin Debug</h1>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Not logged in. Please log in first.
          </div>
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer>
      <div className="py-4">
        <h1 className="text-2xl font-bold mb-6">Admin Debug</h1>

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

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Auth User ID:</p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">{user.id}</p>
            </div>

            <div>
              <p className="font-medium">Auth User Email:</p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">{user.email}</p>
            </div>

            <div>
              <p className="font-medium">Context Admin Status:</p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                isAdmin: {contextIsAdmin ? 'true' : 'false'}<br />
                adminRole: {adminRole || 'null'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Admin Status Check</h2>
          <div className="space-y-4 mb-6">
            <div>
              <p className="font-medium">API Check Result:</p>
              <pre className="text-sm font-mono bg-gray-100 p-2 rounded overflow-auto">
                {loading ? 'Checking...' :
                 adminStatus ? JSON.stringify(adminStatus, null, 2) : 'Not checked'}
              </pre>
            </div>

            <div>
              <p className="font-medium">Direct Database Check:</p>
              <pre className="text-sm font-mono bg-gray-100 p-2 rounded overflow-auto">
                {directCheck ? JSON.stringify(directCheck, null, 2) : 'Not checked'}
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
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

            <button
              onClick={makeAdmin}
              disabled={loading}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
            >
              Make Admin
            </button>

            <button
              onClick={syncAdmin}
              disabled={loading}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
            >
              Sync Admin Status
            </button>

            <button
              onClick={reloadPage}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default AdminDebugPage;
