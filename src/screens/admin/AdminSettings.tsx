import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const AdminSettings: React.FC = () => {
  const { adminRole } = useAuthContext();
  
  // Only superadmins should be able to access this page
  if (adminRole !== 'superadmin') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          You don't have permission to access this page. Only superadmins can access settings.
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-500">Admin settings functionality will be implemented here.</p>
      </div>
    </div>
  );
};

export default AdminSettings;
