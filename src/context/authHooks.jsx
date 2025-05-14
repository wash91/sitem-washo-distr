
import { useState, useEffect, useCallback } from 'react';
import { supabase, getSupabaseClient, isSupabaseConnected } from '@/lib/supabaseClient';
import { ROLES, allPermissionsList } from '@/context/authConstants';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_USER_KEY = 'bijaoWaterApp_authUser';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[AuthHooks][${timestamp}] ${message}`, ...args);
};

const getInitialMockUsersForProfile = () => {
     const mockAdmin = {
        id: uuidv4(),
        name: 'Admin Bijao',
        email: 'admin@bijao.com',
        role: ROLES.ADMIN,
        permissions: allPermissionsList.map(p => p.id),
        created_at: new Date().toISOString(),
    };
    const mockDistributor = {
        id: uuidv4(),
        name: 'Distribuidor Ejemplo',
        email: 'distributor@example.com',
        role: ROLES.DISTRIBUTOR,
        permissions: ['viewDistributorDashboard', 'manageSales', 'manageCustomers', 'viewTruckInventory'],
        created_at: new Date().toISOString(),
    };
    
    const storedUsers = localStorage.getItem('bijaoWaterApp_mockUsers');
    if (storedUsers) {
        try {
            return JSON.parse(storedUsers);
        } catch (e) {
            log('error', "Error parsing mock users from localStorage in getInitialMockUsersForProfile", e);
        }
    }
    return [mockAdmin, mockDistributor]; 
};

export const useSessionManagement = () => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const activeSupabase = getSupabaseClient();

    const fetchUserProfile = useCallback(async (userId) => {
        if (!isSupabaseConnected() || !activeSupabase) {
            log('warn', `Supabase not connected. Attempting to find mock profile for User ID: ${userId}`);
            const mockUsers = getInitialMockUsersForProfile();
            const foundUser = mockUsers.find(u => u.id === userId);
            if (foundUser) {
                const userToReturn = { ...foundUser };
                delete userToReturn.password_hash;
                return userToReturn;
            }
            log('warn', `Mock profile not found for User ID: ${userId}`);
            return null;
        }

        try {
            log('info', `Fetching profile from Supabase for User ID: ${userId}`);
            const { data, error } = await activeSupabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                log('error', `Error fetching profile for User ID ${userId}:`, error.message);
                return null;
            }
            log('info', `Profile fetched for User ID ${userId}:`, data);
            return data;
        } catch (e) {
            log('error', `Exception fetching profile for User ID ${userId}:`, e.message);
            return null;
        }
    }, [activeSupabase, isSupabaseConnected]);


    useEffect(() => {
        setLoadingAuth(true);
        log('info', "Auth effect running. Supabase connected:", isSupabaseConnected());

        const initializeAuth = async () => {
            if (!isSupabaseConnected() || !activeSupabase) {
                log('warn', "Supabase not connected. Checking for local mock session.");
                const localUserStr = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
                if (localUserStr) {
                    try {
                        const localUser = JSON.parse(localUserStr);
                        setUser(localUser);
                        log('info', "Loaded user from local mock session:", localUser);
                    } catch (e) {
                        log('error', "Error parsing local user session", e);
                        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
                    }
                } else {
                    log('info', "No local mock session found.");
                }
                setLoadingAuth(false);
                return;
            }

            log('info', "Supabase connected. Setting up auth state listener.");
            const { data: { session: currentSession } } = await activeSupabase.auth.getSession();
            
            if (currentSession?.user) {
                log('info', "Active Supabase session found on init:", currentSession.user.id);
                const userProfile = await fetchUserProfile(currentSession.user.id);
                if (userProfile) {
                    setUser(userProfile);
                    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
                    log('info', "User profile loaded from active session:", userProfile);
                } else {
                    log('warn', `Active session for ${currentSession.user.id}, but profile fetch failed. Clearing auth state.`);
                    setUser(null);
                    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
                    await activeSupabase.auth.signOut();
                }
            } else {
                log('info', "No active Supabase session found on init. Checking localStorage for persisted Supabase user.");
                 const localUserStr = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
                 if (localUserStr) {
                     try {
                         const localUser = JSON.parse(localUserStr);
                         setUser(localUser);
                         log('info', "Loaded user from persisted Supabase user in localStorage:", localUser);
                     } catch (e) {
                         log('error', "Error parsing persisted Supabase user from localStorage", e);
                         localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
                     }
                 }
            }

            const { data: authListener } = activeSupabase.auth.onAuthStateChange(async (event, session) => {
                log('info', `Auth state changed. Event: ${event}`);
                if (event === 'SIGNED_IN' && session?.user) {
                    log('info', `User SIGNED_IN: ${session.user.id}. Fetching profile.`);
                    const userProfile = await fetchUserProfile(session.user.id);
                    if (userProfile) {
                        setUser(userProfile);
                        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
                        log('info', "Profile set after SIGNED_IN:", userProfile);
                    } else {
                        log('warn', `SIGNED_IN event for ${session.user.id}, but profile fetch failed. Clearing auth state.`);
                        setUser(null);
                        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
                        await activeSupabase.auth.signOut(); 
                    }
                } else if (event === 'SIGNED_OUT') {
                    log('info', "User SIGNED_OUT.");
                    setUser(null);
                    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
                } else if (event === 'USER_UPDATED' && session?.user) {
                    log('info', `User_UPDATED: ${session.user.id}. Re-fetching profile.`);
                     const userProfile = await fetchUserProfile(session.user.id);
                    if (userProfile) {
                        setUser(userProfile);
                        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
                        log('info', "Profile updated after USER_UPDATED:", userProfile);
                    }
                }
                setLoadingAuth(false);
            });
            
            setLoadingAuth(false); 
            return () => {
                if (authListener?.subscription) {
                    authListener.subscription.unsubscribe();
                    log('info', "Auth listener unsubscribed.");
                }
            };
        };

        initializeAuth();

    }, [fetchUserProfile, activeSupabase, isSupabaseConnected]);

    return { user, setUser, loadingAuth, setLoadingAuth, fetchUserProfile };
};
