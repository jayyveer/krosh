import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: 'superadmin' | 'editor' | null;
  checkAdminStatus: () => Promise<void>; // Function to check admin status on demand
  adminChecked: boolean; // Flag to indicate if admin status has been checked
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}