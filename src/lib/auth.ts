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
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      // Don't check admin status here - we'll do it on demand
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      // Reset admin status when auth changes
      setIsAdmin(false);
      setAdminRole(null);
      setAdminChecked(false);
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
        return;
      }

      const isUserAdmin = !!data;
      setIsAdmin(isUserAdmin);

      // Set the admin role if the user is an admin
      if (isUserAdmin && data?.role) {
        setAdminRole(data.role as 'superadmin' | 'editor');
      } else {
        setAdminRole(null);
      }
    } catch (err) {
      setIsAdmin(false);
      setAdminRole(null);
    } finally {
      setAdminChecked(true);
    }
  };

  return { user, loading, isAdmin, adminRole, checkAdminStatus, adminChecked };
}