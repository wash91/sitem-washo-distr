
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionManagement } from '@/context/auth/authHooks';
import { useUserManagement } from '@/context/auth/authManagement';
import { useAdminUserManagement } from '@/context/auth/useAdminUserManagement';
import { ROLES, allPermissionsList } from '@/context/authConstants';
import { supabase } from '@/lib/supabaseClient';


const LOCAL_STORAGE_USER_KEY = 'bijaoWaterApp_authUser';

export const useAuthService = () => {
    const { user, setUser, loadingAuth, setLoadingAuth, fetchUserProfile } = useSessionManagement();
    const navigate = useNavigate();

    const { adminUsersList, refreshAdminUsersList } = useAdminUserManagement(user, loadingAuth);
    
    const { 
        login: loginUser, 
        addUser: addManagedUser, 
        updateUser: updateManagedUser, 
        deleteUser: deleteManagedUser, 
        updateUserPermissions: updateManagedUserPermissions,
    } = useUserManagement(user, setUser, fetchUserProfile, refreshAdminUsersList);
    
    const login = useCallback(async (email, password) => {
        setLoadingAuth(true);
        const result = await loginUser(email, password);
        if (result.success) {
            console.log("AuthService: Login successful, user set.");
        } else {
            console.warn("AuthService: Login failed.", result.error);
            setUser(null);
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
        setLoadingAuth(false);
        return result;
    }, [loginUser, setLoadingAuth, setUser]);

    const logout = useCallback(async () => {
        console.log("AuthService: Logging out user.");
        setLoadingAuth(true);
        if (supabase) {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error signing out from Supabase:", error);
            }
        }
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        setUser(null);
        setLoadingAuth(false);
        navigate('/login', { replace: true });
    }, [navigate, setLoadingAuth, setUser]);
    
    const addUser = useCallback(async (userData, password) => {
        const result = await addManagedUser(userData, password);
        if (result.success && refreshAdminUsersList) {
            await refreshAdminUsersList();
        }
        return result;
    }, [addManagedUser, refreshAdminUsersList]);

    const updateUser = useCallback(async (userId, updatedData) => {
        const result = await updateManagedUser(userId, updatedData);
        if (result.success) {
            if (user?.id === userId) {
                 const refreshedProfile = await fetchUserProfile(userId);
                 if(refreshedProfile) setUser(prev => ({ ...prev, ...refreshedProfile }));
            }
            if (refreshAdminUsersList) await refreshAdminUsersList();
        }
        return result;
    }, [updateManagedUser, user, fetchUserProfile, setUser, refreshAdminUsersList]);
    
    const deleteUserAndHandleLogout = useCallback(
        async (userId) => {
            const result = await deleteManagedUser(userId, logout);
            if (result.success && refreshAdminUsersList) {
                 await refreshAdminUsersList();
            }
            return result;
        },
        [deleteManagedUser, logout, refreshAdminUsersList] 
    );

    const updateUserPermissions = useCallback(async (userId, newPermissions) => {
        const result = await updateManagedUserPermissions(userId, newPermissions);
         if (result.success) {
            if (user?.id === userId) {
                 const refreshedProfile = await fetchUserProfile(userId);
                 if(refreshedProfile) setUser(prev => ({ ...prev, ...refreshedProfile, permissions: newPermissions }));
            }
            if (refreshAdminUsersList) await refreshAdminUsersList();
        }
        return result;
    }, [updateManagedUserPermissions, user, fetchUserProfile, setUser, refreshAdminUsersList]);

    const getAllUsers = useCallback(() => adminUsersList, [adminUsersList]);

    const hasPermission = useCallback((permissionId) => {
        if (!user) return false;
        if (user.role === ROLES.ADMIN) return true; 
        return Array.isArray(user.permissions) && user.permissions.includes(permissionId);
    }, [user]);

    return useMemo(() => ({
        user,
        users: adminUsersList, 
        login,
        logout,
        addUser,
        updateUser,
        deleteUser: deleteUserAndHandleLogout,
        getAllUsers, 
        updateUserPermissions,
        hasPermission,
        allPermissions: allPermissionsList,
        ROLES,
        loadingAuth,
        refreshUsersList: refreshAdminUsersList
    }), [
        user, 
        adminUsersList, 
        login, 
        logout, 
        addUser, 
        updateUser, 
        deleteUserAndHandleLogout, 
        getAllUsers, 
        updateUserPermissions, 
        hasPermission, 
        ROLES, 
        loadingAuth, 
        refreshAdminUsersList
    ]);
};
