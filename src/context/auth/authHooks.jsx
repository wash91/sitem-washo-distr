
import { useState, useEffect, useCallback } from 'react';
import { ROLES, allPermissionsList } from '@/context/authConstants.jsx';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_USER_KEY = 'bijaoWaterApp_authUser';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[AuthHooks-Local][${timestamp}] ${message}`, ...args);
};

const getInitialMockUsersForProfile = () => {
     const mockAdmin = {
        id: 'admin-mock-id', 
        name: 'Admin Bijao (Local)',
        email: 'admin@bijao.com',
        role: ROLES.ADMIN,
        permissions: allPermissionsList.map(p => p.id),
        created_at: new Date().toISOString(),
    };
    const mockDistributor = {
        id: 'distributor-mock-id', 
        name: 'Distribuidor Ejemplo (Local)',
        email: 'distributor@example.com',
        role: ROLES.DISTRIBUTOR,
        permissions: ['viewDistributorDashboard', 'manageSales', 'manageCustomers', 'viewTruckInventory'],
        created_at: new Date().toISOString(),
    };
    
    const storedUsers = localStorage.getItem('bijaoWaterApp_mockUsers');
    if (storedUsers) {
        try {
            const parsedUsers = JSON.parse(storedUsers);
            return parsedUsers.map(u => ({...u, id: u.id || uuidv4() })); 
        } catch (e) {
            log('error', "Error parsing mock users from localStorage in getInitialMockUsersForProfile", e);
        }
    }
    
    const initialUsers = [mockAdmin, mockDistributor];
    localStorage.setItem('bijaoWaterApp_mockUsers', JSON.stringify(initialUsers.map(u => {
        const userCopy = {...u};
        delete userCopy.password_hash; 
        return userCopy;
    })));
    return initialUsers;
};

export const useSessionManagement = () => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const fetchUserProfile = useCallback(async (userId) => {
        log('warn', `Local Mode: Attempting to find mock profile for User ID: ${userId}`);
        const mockUsers = getInitialMockUsersForProfile();
        const foundUser = mockUsers.find(u => u.id === userId);
        
        if (foundUser) {
            const userToReturn = { ...foundUser };
            delete userToReturn.password_hash; 
            log('info', `Local Mode: Mock profile found for User ID ${userId}:`, userToReturn);
            return userToReturn;
        }
        log('warn', `Local Mode: Mock profile not found for User ID: ${userId}`);
        return null;
    }, []);


    useEffect(() => {
        setLoadingAuth(true);
        log('info', "Auth effect running (Local Mode).");

        const initializeAuth = async () => {
            log('warn', "Local Mode: Supabase not connected. Checking for local mock session.");
            const localUserStr = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
            if (localUserStr) {
                try {
                    const localUser = JSON.parse(localUserStr);
                    setUser(localUser);
                    log('info', "Local Mode: Loaded user from local mock session:", localUser);
                } catch (e) {
                    log('error', "Local Mode: Error parsing local user session", e);
                    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
                }
            } else {
                log('info', "Local Mode: No local mock session found.");
            }
            setLoadingAuth(false);
        };

        initializeAuth();

    }, [fetchUserProfile]);

    return { user, setUser, loadingAuth, setLoadingAuth, fetchUserProfile };
};
