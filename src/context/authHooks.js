
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useSessionManagement = () => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const fetchUserProfile = useCallback(async (userId) => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, name, role, permissions, email')
            .eq('id', userId)
            .single();
        if (error) {
            console.error('Error fetching profile:', error.message, error.details);
            if (error.code === 'PGRST116' || error.code === '42P01') { // PGRST116: "Searched item was not found", 42P01: relation does not exist
                 console.warn(`Profile for user ${userId} not found or profiles table missing. This might be expected if the user was just created and the trigger hasn't run yet, or if the table is missing.`);
            }
            return null;
        }
        return profile;
    }, []);

    useEffect(() => {
        const getSession = async () => {
            setLoadingAuth(true);
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error getting session:", error);
                setUser(null);
                setLoadingAuth(false);
                return;
            }

            if (session?.user) {
                const profile = await fetchUserProfile(session.user.id);
                if (profile) {
                    setUser({ ...session.user, ...profile });
                } else {
                    console.warn(`User session found for ${session.user.id}, but no profile. Logging out.`);
                    await supabase.auth.signOut();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoadingAuth(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setLoadingAuth(true);
            if (session?.user) {
                const profile = await fetchUserProfile(session.user.id);
                if (profile) {
                    setUser({ ...session.user, ...profile });
                } else {
                    console.warn(`Auth state change: User session for ${session.user.id} found, but no profile. Potential race condition or missing profile. Logging out.`);
                    await supabase.auth.signOut();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoadingAuth(false);
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, [fetchUserProfile]);

    return { user, setUser, loadingAuth, setLoadingAuth, fetchUserProfile };
};
