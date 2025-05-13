import { supabase } from './supabase';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          name,
        },
      ]);

    if (profileError) throw profileError;
  }

  return data;
}

export async function signIn(email: string, password: string) {
  // First, sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Check if the user is disabled
  if (data.user) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('disabled')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      // If there's an error checking disabled status, proceed with caution
      console.error('Error checking user disabled status:', userError);
    } else if (userData?.disabled) {
      // If the user is disabled, sign them out and throw an error
      await supabase.auth.signOut();
      throw new Error('ACCOUNT_DISABLED');
    }
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Helper functions to manage admin status in localStorage
const getStoredAdminStatus = (userId: string | undefined) => {
  if (!userId) return null;

  try {
    const storedData = localStorage.getItem(`admin_status_${userId}`);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Check if the data is still valid (less than 1 hour old)
      if (parsedData.timestamp && Date.now() - parsedData.timestamp < 3600000) {
        return parsedData;
      }
    }
  } catch (err) {
    console.error('Error reading admin status from localStorage:', err);
  }

  return null;
};

const storeAdminStatus = (userId: string, isAdmin: boolean, adminRole: string | null) => {
  try {
    localStorage.setItem(`admin_status_${userId}`, JSON.stringify({
      isAdmin,
      adminRole,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error('Error storing admin status in localStorage:', err);
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<'superadmin' | 'editor' | null>(null);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Try to get admin status from localStorage
      if (currentUser) {
        const storedStatus = getStoredAdminStatus(currentUser.id);
        if (storedStatus) {
          setIsAdmin(storedStatus.isAdmin);
          setAdminRole(storedStatus.adminRole);
          setAdminChecked(true);
        }
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // If user changed, try to get admin status from localStorage
      if (currentUser) {
        const storedStatus = getStoredAdminStatus(currentUser.id);
        if (storedStatus) {
          setIsAdmin(storedStatus.isAdmin);
          setAdminRole(storedStatus.adminRole);
          setAdminChecked(true);
        } else {
          // Reset admin status when auth changes and no stored status
          setIsAdmin(false);
          setAdminRole(null);
          setAdminChecked(false);
        }
      } else {
        // Reset admin status when user logs out
        setIsAdmin(false);
        setAdminRole(null);
        setAdminChecked(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async () => {
    // If already checked or no user, don't check again
    if (adminChecked || !user) {
      return;
    }

    const userId = user.id;

    try {
      // First, try using the is_user_admin function
      try {
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_user_admin', {
          user_id: userId
        });

        if (!isAdminError && isAdminData === true) {
          // User is an admin, now get their role
          const { data, error } = await supabase
            .from('admins')
            .select('role')
            .eq('id', userId)
            .single();

          if (!error && data && data.role) {
            setIsAdmin(true);
            setAdminRole(data.role as 'superadmin' | 'editor');
            setAdminChecked(true);

            // Store admin status in localStorage
            storeAdminStatus(userId, true, data.role);
            return;
          }
        }
      } catch (rpcErr) {
        // Continue with the fallback method
      }

      // Fallback: direct query to the admins table
      const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        setIsAdmin(false);
        setAdminRole(null);
        setAdminChecked(true);

        // Store admin status in localStorage
        storeAdminStatus(userId, false, null);
        return;
      }

      const isUserAdmin = !!data;
      setIsAdmin(isUserAdmin);

      // Set the admin role if the user is an admin
      if (isUserAdmin && data?.role) {
        setAdminRole(data.role as 'superadmin' | 'editor');

        // Store admin status in localStorage
        storeAdminStatus(userId, true, data.role);
      } else {
        setAdminRole(null);

        // Store admin status in localStorage
        storeAdminStatus(userId, false, null);
      }
    } catch (err) {
      setIsAdmin(false);
      setAdminRole(null);

      // Store admin status in localStorage
      storeAdminStatus(userId, false, null);
    } finally {
      setAdminChecked(true);
    }
  };

  return { user, loading, isAdmin, adminRole, checkAdminStatus, adminChecked };
}