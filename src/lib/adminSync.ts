import { supabase } from './supabase';

/**
 * Synchronizes the admin status by forcing a refresh
 * This is useful when the admin status is not being properly detected
 */
export async function syncAdminStatus(userId: string) {
  if (!userId) {
    console.error('Cannot sync admin status: No user ID provided');
    return { success: false, message: 'No user ID provided' };
  }
  
  try {
    // First, check if the user exists in the admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (adminError && adminError.code !== 'PGRST116') {
      console.error('Error checking admin status:', adminError);
      return { success: false, message: 'Error checking admin status' };
    }
    
    // If the user is not an admin, make them one using the RPC function
    if (!adminData) {
      // Get the user's email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error getting user email:', userError);
        return { success: false, message: 'Error getting user email' };
      }
      
      // Make the user an admin
      const { data: makeAdminData, error: makeAdminError } = await supabase
        .rpc('make_user_admin', {
          user_id: userId,
          user_email: userData.email,
          admin_role: 'superadmin'
        });
      
      if (makeAdminError) {
        console.error('Error making user admin:', makeAdminError);
        return { success: false, message: 'Error making user admin' };
      }
      
      return { 
        success: true, 
        message: 'User made admin successfully',
        data: makeAdminData
      };
    }
    
    // If the user is already an admin, return success
    return { 
      success: true, 
      message: 'User is already an admin',
      data: adminData
    };
  } catch (err) {
    console.error('Exception in syncAdminStatus:', err);
    return { success: false, message: 'Exception in syncAdminStatus' };
  }
}

/**
 * Forces a reload of the admin status
 * This is useful when the admin status is not being properly detected
 */
export function forceAdminReload() {
  // Force a reload of the page
  window.location.reload();
}
