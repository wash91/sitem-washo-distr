
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConnected, getSupabaseClient } from '@/lib/supabaseClient';
import { ROLES } from '@/context/authConstants';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[AdminUserManagement][${timestamp}] ${message}`, ...args);
};

const getMockUsersFromStorageForAdmin = () => {
    const storedUsers = localStorage.getItem('bijaoWaterApp_mockUsers');
    if (storedUsers) {
        try {
            return JSON.parse(storedUsers);
        } catch (e) {
            log('error', "Error parsing mock users from localStorage for admin", e);
        }
    }
    return []; 
};


export const useAdminUserManagement = (currentUser, isLoadingAuth) => {
    const [adminUsersList, setAdminUsersList] = useState([]);
    const activeSupabase = getSupabaseClient();

    const refreshAdminUsersList = useCallback(async () => {
        if (isLoadingAuth || !currentUser || currentUser.role !== ROLES.ADMIN) {
            setAdminUsersList([]);
            if (!isLoadingAuth && currentUser && currentUser.role !== ROLES.ADMIN) {
                 log('info', 'Current user is not admin. Admin users list cleared.');
            }
            return;
        }

        if (!isSupabaseConnected() || !activeSupabase) {
            log('warn', "Supabase not connected. Loading mock users for admin.");
            const mockUsers = getMockUsersFromStorageForAdmin();
            setAdminUsersList(mockUsers.map(u => { delete u.password_hash; return u; }));
            return;
        }
        
        log('info', "Admin user detected. Fetching all user profiles from Supabase.");
        const { data, error } = await activeSupabase
            .from('profiles')
            .select('*');

        if (error) {
            log('error', "Error fetching all user profiles:", error.message);
            setAdminUsersList([]);
        } else {
            setAdminUsersList(data || []);
            log('info', `Fetched ${data?.length || 0} user profiles for admin.`);
        }
    }, [currentUser, isLoadingAuth, activeSupabase, isSupabaseConnected]);

    useEffect(() => {
        refreshAdminUsersList();
    }, [refreshAdminUsersList]);

    return { adminUsersList, refreshAdminUsersList };
};
