
import React, { useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConnected, getSupabaseClient } from '@/lib/supabaseClient';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[DistributorManagement][${timestamp}] ${message}`, ...args);
};

export const useDistributorManagement = (setDistributorsState, loadingAuthProp, userProp) => {
    const { user: authUser, ROLES, users: allAuthUsersFromAuthContext, loadingAuth: authLoading } = useAuth();
    const activeSupabase = getSupabaseClient();
    
    const effectiveUser = userProp !== undefined ? userProp : authUser;
    const effectiveLoadingAuth = loadingAuthProp !== undefined ? loadingAuthProp : authLoading;

    const refreshDistributors = useCallback(async () => {
        if (!isSupabaseConnected() || !activeSupabase) {
            log('warn', "Supabase not connected. Attempting to load mock distributors from AuthContext.");
            if (effectiveUser?.role === ROLES.ADMIN && allAuthUsersFromAuthContext) {
                const mockDistributors = allAuthUsersFromAuthContext.filter(u => u.role === ROLES.DISTRIBUTOR);
                setDistributorsState(mockDistributors);
                log('info', `Loaded ${mockDistributors.length} mock distributors for admin from AuthContext.`);
            } else {
                setDistributorsState([]);
                log('info', "Not admin or no mock users available in AuthContext. Distributors set to empty.");
            }
            return;
        }

        if (effectiveUser?.role === ROLES.ADMIN) {
            log('info', "Admin user detected. Fetching distributors from Supabase 'profiles' table.");
            const { data, error } = await activeSupabase
                .from('profiles') 
                .select('id, name, email, role, permissions, created_at')
                .eq('role', ROLES.DISTRIBUTOR);
            if (error) {
                log('error', "Error fetching distributors from Supabase:", error.message);
                setDistributorsState([]);
            } else {
                setDistributorsState(data || []);
                log('info', `Successfully fetched ${data?.length || 0} distributors from Supabase.`);
            }
        } else {
            log('info', "Non-admin user or no user. Distributors list set to empty (not fetching from Supabase).");
            setDistributorsState([]);
        }
    }, [effectiveUser, ROLES, allAuthUsersFromAuthContext, setDistributorsState, activeSupabase, isSupabaseConnected]);

    useEffect(() => {
        if (effectiveUser?.id && !effectiveLoadingAuth) {
            log('debug', `User detected (ID: ${effectiveUser.id}), effectiveLoadingAuth is false. Calling refreshDistributors.`);
            refreshDistributors();
        } else if (!effectiveUser?.id && !effectiveLoadingAuth) {
            log('debug', "No user ID and effectiveLoadingAuth is false. Setting distributors to empty array.");
            setDistributorsState([]);
        } else if (effectiveLoadingAuth) {
            log('debug', "Auth is still loading (effectiveLoadingAuth is true). Waiting to refresh distributors.");
        }
    }, [effectiveUser, effectiveLoadingAuth, refreshDistributors, setDistributorsState]);

    return { refreshDistributors };
};
