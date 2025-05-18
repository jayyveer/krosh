import { supabase } from './supabase';

/**
 * Manually syncs the current user from auth.users to public.users
 * This is useful if a user was created in auth.users but not in public.users
 * @returns True if the sync was successful, false otherwise
 */
export async function syncUser() {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if the user exists in public.users
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    // If the user already exists in public.users, no need to sync
    if (publicUser) return true;

    // If the user doesn't exist in public.users, create it
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error syncing user:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in syncUser:', err);
    return false;
  }
}
