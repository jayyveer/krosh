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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<'superadmin' | 'editor' | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user?.id);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user?.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      setAdminRole(null);
      return;
    }

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
            console.log('Admin check result (via RPC):', {
              userId,
              isAdmin: true,
              role: data.role
            });
            return;
          }
        }
      } catch (rpcErr) {
        console.error('Error using is_user_admin RPC:', rpcErr);
        // Continue with the fallback method
      }

      // Fallback: direct query to the admins table
      const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminRole(null);
        return;
      }

      const isUserAdmin = !!data;
      setIsAdmin(isUserAdmin);

      // Set the admin role if the user is an admin
      if (isUserAdmin && data.role) {
        setAdminRole(data.role as 'superadmin' | 'editor');
      } else {
        setAdminRole(null);
      }

      console.log('Admin check result (via direct query):', {
        userId,
        isAdmin: isUserAdmin,
        role: isUserAdmin ? data.role : null
      });
    } catch (err) {
      console.error('Exception in checkAdminStatus:', err);
      setIsAdmin(false);
      setAdminRole(null);
    }
  };

  return { user, loading, isAdmin, adminRole };
}