
import { useState, useEffect, useCallback } from 'react';
import { ROLES } from '@/context/authConstants.jsx';
import { getMockUsersFromStorage } from '@/context/auth/localUserStorage.jsx';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[AdminUserManagement-Local][${timestamp}] ${message}`, ...args);
};

export const useAdminUserManagement = (currentUser, isLoadingAuth) => {
    const [adminUsersList, setAdminUsersList] = useState([]);

    const refreshAdminUsersList = useCallback(async () => {
        log('info', 'Local Mode: refreshAdminUsersList called.');
        if (isLoadingAuth) {
            log('info', 'Local Mode: Auth is loading, refreshAdminUsersList deferred.');
            return;
        }
        if (!currentUser) {
            log('info', 'Local Mode: No current user, admin list cleared.');
            setAdminUsersList([]);
            return;
        }
        if (currentUser.role !== ROLES.ADMIN) {
            log('info', 'Local Mode: Current user is not admin. Admin users list cleared.');
            setAdminUsersList([]);
            return;
        }

        log('info', "Local Mode: Supabase not connected. Loading mock users for admin.");
        const mockUsers = getMockUsersFromStorage();
        const usersForAdmin = mockUsers.map(u => { 
            const userCopy = {...u};
            delete userCopy.password_hash; 
            return userCopy; 
        });
        setAdminUsersList(usersForAdmin);
        log('info', `Local Mode: Fetched ${usersForAdmin.length} mock user profiles for admin.`, usersForAdmin);

    }, [currentUser, isLoadingAuth]);

    useEffect(() => {
        log('info', 'Local Mode: useEffect in useAdminUserManagement triggered refreshAdminUsersList.');
        refreshAdminUsersList();
    }, [refreshAdminUsersList]);

    return { adminUsersList, refreshAdminUsersList };
};
