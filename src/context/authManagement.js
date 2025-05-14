
import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ROLES, allPermissionsList } from '@/context/authConstants';

export const useUserManagement = (currentUser, setCurrentUser, fetchUserProfileCallback, refreshAdminUserListCallback) => {
    const login = useCallback(async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error('Login error:', error);
                // Check for specific error messages if needed, e.g. error.message.includes("Email not confirmed")
                return { success: false, error: error.message || 'An unknown authentication error occurred.' };
            }
            if (data.user) {
                const profile = await fetchUserProfileCallback(data.user.id);
                if (profile) {
                    setCurrentUser({ ...data.user, ...profile });
                    return { success: true };
                } else {
                    console.error('Login successful but profile not found. User might need to be created in profiles table or trigger might have failed.');
                    await supabase.auth.signOut(); 
                    return { success: false, error: 'Profile not found. Please contact support.' };
                }
            }
            return { success: false, error: 'Unknown login error: No user data returned.' };
        } catch (e) {
            // Catching potential network errors or other exceptions during fetch
            console.error('Network or unexpected error during login:', e);
            if (e.message && e.message.toLowerCase().includes('failed to fetch')) {
                 return { success: false, error: 'Network error: Failed to connect to authentication server. Please check your internet connection.' };
            }
            return { success: false, error: e.message || 'An unexpected error occurred.' };
        }
    }, [fetchUserProfileCallback, setCurrentUser]);

    const addUser = useCallback(async (userData) => {
        const { name, email, password, role } = userData;
        const defaultPermissions = role === ROLES.DISTRIBUTOR
            ? allPermissionsList
                .filter(p => !['manageUsers', 'manageTrucks', 'manageProducts', 'manageOrders', 'viewReports', 'managePermissions', 'viewDashboard'].includes(p.id))
                .map(p => p.id)
            : [];

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                    permissions: defaultPermissions 
                }
            }
        });

        if (authError) {
            console.error('Error adding user (signUp):', authError);
            return { success: false, error: authError.message };
        }
        
        if (authData.user) {
          // The trigger should handle profile creation. We just refresh the list.
          if (refreshAdminUserListCallback) await refreshAdminUserListCallback();
          return { success: true, user: authData.user };
        }
        return { success: false, error: 'Failed to create user object during sign up' };
    }, [refreshAdminUserListCallback]);

    const updateUser = useCallback(async (userId, updatedData) => {
        const { name, email: newEmail, password, role, permissions } = updatedData;
        
        let authUserUpdatePayload = {};
        if (newEmail) authUserUpdatePayload.email = newEmail;
        if (password) authUserUpdatePayload.password = password;
        
        let userMetaDataUpdate = {};
        if (name !== undefined) userMetaDataUpdate.name = name;
        if (role !== undefined) userMetaDataUpdate.role = role;
        if (permissions !== undefined) userMetaDataUpdate.permissions = permissions;

        if (Object.keys(userMetaDataUpdate).length > 0) {
            authUserUpdatePayload.data = userMetaDataUpdate;
        }
        
        if (Object.keys(authUserUpdatePayload).length > 0) {
            const { data: adminUpdateResult, error: adminUpdateError } = await supabase.auth.admin.updateUserById(userId, authUserUpdatePayload);
            if (adminUpdateError) {
                console.error('Error updating user with supabase.auth.admin.updateUserById:', adminUpdateError);
                return { success: false, error: adminUpdateError.message };
            }
        } else if (Object.keys(userMetaDataUpdate).length > 0) {
             // This case is unlikely if authUserUpdatePayload.data is set correctly with userMetaDataUpdate
             // but as a fallback if only profile data needs update directly (not through auth user metadata trigger)
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ name, role, permissions, updated_at: new Date().toISOString() })
                .eq('id', userId);
            if (profileError) {
                 console.error('Error updating profile directly:', profileError);
                 return { success: false, error: profileError.message };
            }
        }
        
        if (currentUser?.id === userId) {
            const refreshedProfile = await fetchUserProfileCallback(userId);
            if(refreshedProfile) setCurrentUser(prev => ({ ...prev, ...refreshedProfile }));
        }
        if (refreshAdminUserListCallback) await refreshAdminUserListCallback();
        return { success: true };
    }, [currentUser, fetchUserProfileCallback, setCurrentUser, refreshAdminUserListCallback]);
    
    const deleteUser = useCallback(async (userId, logoutCallback) => {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
        if (currentUser?.id === userId && logoutCallback) {
            await logoutCallback();
        }
        if (refreshAdminUserListCallback) await refreshAdminUserListCallback();
        return { success: true };
    }, [currentUser, refreshAdminUserListCallback]);

    const updateUserPermissions = useCallback(async (userId, newPermissions) => {
        const { data: userBeforeUpdate, error: getUserError } = await supabase.auth.admin.getUserById(userId);
        if (getUserError) {
            console.error('Error fetching user before permission update:', getUserError);
            return { success: false, error: getUserError.message };
        }

        const existingMetaData = userBeforeUpdate.user.user_metadata || {};
        const newMetaData = { ...existingMetaData, permissions: newPermissions };

        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            data: newMetaData
        });

       if (updateError) {
           console.error('Error updating user metadata for permissions:', updateError);
           return { success: false, error: updateError.message };
       }
       if (currentUser?.id === userId) {
            const refreshedProfile = await fetchUserProfileCallback(userId);
            if(refreshedProfile) setCurrentUser(prev => ({ ...prev, ...refreshedProfile }));
       }
       if (refreshAdminUserListCallback) await refreshAdminUserListCallback();
       return { success: true };
   }, [currentUser, setCurrentUser, fetchUserProfileCallback, refreshAdminUserListCallback]);

    const fetchAllUsersForAdminCallback = useCallback(async () => {
        if (currentUser?.role !== ROLES.ADMIN) return [];
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, name, role, permissions, email');

        if (error) {
            console.error('Error fetching profiles for admin:', error);
            return [];
        }
        return profiles || [];
    }, [currentUser]);


    return { login, addUser, updateUser, deleteUser, updateUserPermissions, fetchAllUsersForAdmin: fetchAllUsersForAdminCallback };
};
