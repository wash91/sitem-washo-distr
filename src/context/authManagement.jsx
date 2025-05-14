
import { supabase, getSupabaseClient, isSupabaseConnected } from '@/lib/supabaseClient';
import { ROLES, allPermissionsList } from '@/context/authConstants';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_USER_KEY = 'bijaoWaterApp_authUser';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[AuthManagement][${timestamp}] ${message}`, ...args);
};

const getInitialMockUsers = () => {
    const mockAdmin = {
        id: uuidv4(),
        name: 'Admin Bijao',
        email: 'admin@bijao.com',
        role: ROLES.ADMIN,
        permissions: allPermissionsList.map(p => p.id),
        created_at: new Date().toISOString(),
        password_hash: 'adminpassword', 
    };
    const mockDistributor = {
        id: uuidv4(),
        name: 'Distribuidor Ejemplo',
        email: 'distributor@example.com',
        role: ROLES.DISTRIBUTOR,
        permissions: ['viewDistributorDashboard', 'manageSales', 'manageCustomers', 'viewTruckInventory'],
        created_at: new Date().toISOString(),
        password_hash: 'distributorpassword',
    };
    return [mockAdmin, mockDistributor];
};

const getMockUsersFromStorage = () => {
    const storedUsers = localStorage.getItem('bijaoWaterApp_mockUsers');
    if (storedUsers) {
        try {
            return JSON.parse(storedUsers);
        } catch (e) {
            log('error', "Error parsing mock users from localStorage", e);
            localStorage.removeItem('bijaoWaterApp_mockUsers'); 
        }
    }
    const initialUsers = getInitialMockUsers();
    localStorage.setItem('bijaoWaterApp_mockUsers', JSON.stringify(initialUsers));
    return initialUsers;
};

const saveMockUsersToStorage = (users) => {
    localStorage.setItem('bijaoWaterApp_mockUsers', JSON.stringify(users));
};

export const useUserManagement = (currentUser, setCurrentUserGlobally, fetchUserProfileGlobally, refreshAdminUsersListCallback) => {
    const activeSupabase = getSupabaseClient();

    const login = async (email, password) => {
        if (!isSupabaseConnected() || !activeSupabase) {
            log('warn', "Supabase not connected. Attempting mock login.");
            const mockUsers = getMockUsersFromStorage();
            const foundUser = mockUsers.find(u => u.email === email);

            if (foundUser && ((foundUser.email === 'admin@bijao.com' && password === 'adminpassword') || (foundUser.email !== 'admin@bijao.com' && foundUser.password_hash === password) || (foundUser.email !== 'admin@bijao.com' /* allow any for non-admin mock */) )) {
                const userToStore = { ...foundUser };
                delete userToStore.password_hash;
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userToStore));
                setCurrentUserGlobally(userToStore);
                log('info', `Mock login successful for ${email}.`);
                return { success: true, user: userToStore };
            }
            log('warn', `Mock login failed for ${email}.`);
            return { success: false, error: "Credenciales inválidas (local)." };
        }
        
        log('info', `Attempting Supabase login for ${email}.`);
        const { data: loginData, error: loginError } = await activeSupabase.auth.signInWithPassword({ email, password });

        if (loginError) {
            log('error', "Supabase login error:", loginError.message);
            return { success: false, error: loginError.message };
        }

        if (loginData.user) {
            const userProfile = await fetchUserProfileGlobally(loginData.user.id);
            if (userProfile) {
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
                setCurrentUserGlobally(userProfile);
                log('info', `Supabase login successful for ${email}. Profile fetched.`);
                return { success: true, user: userProfile };
            } else {
                log('warn', `Supabase login successful for ${email}, but profile fetch failed. User ID: ${loginData.user.id}`);
                 await activeSupabase.auth.signOut(); 
                return { success: false, error: "No se pudo cargar el perfil del usuario." };
            }
        }
        log('warn', `Supabase login for ${email} did not return a user object.`);
        return { success: false, error: "Error desconocido durante el inicio de sesión." };
    };

    const addUser = async (userData, password) => {
        if (!isSupabaseConnected() || !activeSupabase) {
            log('warn', "Supabase not connected. Attempting mock user add.");
            const mockUsers = getMockUsersFromStorage();
            const newUser = { ...userData, id: uuidv4(), created_at: new Date().toISOString(), password_hash: password };
            mockUsers.push(newUser);
            saveMockUsersToStorage(mockUsers);
            if (refreshAdminUsersListCallback) refreshAdminUsersListCallback();
            log('info', `Mock user added: ${userData.email}.`);
            return { success: true, user: newUser };
        }

        log('info', `Attempting to add user via Supabase: ${userData.email}.`);
        const { data: authData, error: authError } = await activeSupabase.auth.signUp({
            email: userData.email,
            password: password,
            options: {
                data: { 
                    name: userData.name,
                    role: userData.role || ROLES.DISTRIBUTOR,
                    permissions: userData.permissions || [],
                }
            }
        });

        if (authError) {
            log('error', "Supabase signUp error:", authError.message);
            return { success: false, error: authError.message };
        }

        if (authData.user) {
            log('info', `User created in auth: ${authData.user.email}. Now creating profile.`);
            const profileData = {
                id: authData.user.id,
                name: userData.name,
                email: userData.email,
                role: userData.role || ROLES.DISTRIBUTOR,
                permissions: userData.permissions || [],
                created_at: new Date().toISOString(),
            };

            const { error: profileError } = await activeSupabase.from('profiles').insert(profileData);

            if (profileError) {
                log('error', "Error creating user profile in Supabase:", profileError.message);
                return { success: false, error: `Usuario creado en autenticación, pero falló creación de perfil: ${profileError.message}` };
            }
            log('info', `Profile created for ${userData.email}.`);
            if (refreshAdminUsersListCallback) await refreshAdminUsersListCallback();
            return { success: true, user: { ...authData.user, ...profileData } };
        }
        log('warn', 'Supabase signUp did not return a user object.');
        return { success: false, error: "No se pudo crear el usuario en autenticación." };
    };
    
    const updateUser = async (userIdToUpdate, updatedData) => {
        if (!isSupabaseConnected() || !activeSupabase) {
            log('warn', "Supabase not connected. Attempting mock user update.");
            let mockUsers = getMockUsersFromStorage();
            const userIndex = mockUsers.findIndex(u => u.id === userIdToUpdate);
            if (userIndex !== -1) {
                mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedData };
                saveMockUsersToStorage(mockUsers);
                if (currentUser?.id === userIdToUpdate) {
                     const userToStore = { ...mockUsers[userIndex] };
                     delete userToStore.password_hash;
                     setCurrentUserGlobally(userToStore);
                     localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userToStore));
                }
                if (refreshAdminUsersListCallback) refreshAdminUsersListCallback();
                log('info', `Mock user updated: ${mockUsers[userIndex].email}.`);
                return { success: true, user: mockUsers[userIndex] };
            }
            return { success: false, error: "Usuario no encontrado para actualizar (local)." };
        }

        log('info', `Attempting to update user profile in Supabase for ID: ${userIdToUpdate}.`);
        
        const profileUpdatePayload = { ...updatedData };
        delete profileUpdatePayload.id; 
        delete profileUpdatePayload.email; 
        delete profileUpdatePayload.created_at;

        const { data, error } = await activeSupabase
            .from('profiles')
            .update(profileUpdatePayload)
            .eq('id', userIdToUpdate)
            .select()
            .single();

        if (error) {
            log('error', "Error updating user profile in Supabase:", error.message);
            return { success: false, error: error.message };
        }
        
        log('info', `User profile updated successfully for ID: ${userIdToUpdate}.`);
        if (currentUser?.id === userIdToUpdate) {
            setCurrentUserGlobally(data); 
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data));
        }
        if (refreshAdminUsersListCallback) await refreshAdminUsersListCallback();
        return { success: true, user: data };
    };

    const deleteUser = async (userIdToDelete, logoutCallback) => {
         if (!isSupabaseConnected() || !activeSupabase) {
            log('warn', "Supabase not connected. Attempting mock user delete.");
            let mockUsers = getMockUsersFromStorage();
            const initialLength = mockUsers.length;
            mockUsers = mockUsers.filter(u => u.id !== userIdToDelete);
            if (mockUsers.length < initialLength) {
                saveMockUsersToStorage(mockUsers);
                 if (currentUser?.id === userIdToDelete) {
                    logoutCallback();
                }
                if (refreshAdminUsersListCallback) refreshAdminUsersListCallback();
                log('info', `Mock user deleted: ${userIdToDelete}.`);
                return { success: true };
            }
            return { success: false, error: "Usuario no encontrado para eliminar (local)." };
        }

        log('info', `Attempting to delete user from Supabase (admin function call) for ID: ${userIdToDelete}.`);
        
        const { data, error } = await activeSupabase.functions.invoke('delete-user', {
            body: { userId: userIdToDelete }
        });

        if (error) {
            log('error', 'Error invoking delete-user Supabase function:', error);
            return { success: false, error: error.message || 'Error al eliminar usuario del servidor.' };
        }
        
        if (data && data.error) {
            log('error', 'Supabase function returned an error for delete-user:', data.error);
            return { success: false, error: data.error };
        }

        log('info', `User deletion process initiated successfully for ID: ${userIdToDelete}.`);
        if (currentUser?.id === userIdToDelete) {
           await activeSupabase.auth.signOut();
           logoutCallback();
        }
        if (refreshAdminUsersListCallback) await refreshAdminUsersListCallback();
        return { success: true };
    };

    const updateUserPermissions = async (userIdToUpdate, newPermissions) => {
         if (!isSupabaseConnected() || !activeSupabase) {
            log('warn', "Supabase not connected. Attempting mock permission update.");
            let mockUsers = getMockUsersFromStorage();
            const userIndex = mockUsers.findIndex(u => u.id === userIdToUpdate);
            if (userIndex !== -1) {
                mockUsers[userIndex].permissions = newPermissions;
                saveMockUsersToStorage(mockUsers);
                if (currentUser?.id === userIdToUpdate) {
                     const userToStore = { ...mockUsers[userIndex] };
                     delete userToStore.password_hash;
                     setCurrentUserGlobally(userToStore);
                     localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userToStore));
                }
                if (refreshAdminUsersListCallback) refreshAdminUsersListCallback();
                log('info', `Mock user permissions updated for ${mockUsers[userIndex].email}.`);
                return { success: true, user: mockUsers[userIndex] };
            }
            return { success: false, error: "Usuario no encontrado para actualizar permisos (local)." };
        }

        log('info', `Updating permissions for user ID ${userIdToUpdate} in Supabase.`);
        const { data, error } = await activeSupabase
            .from('profiles')
            .update({ permissions: newPermissions })
            .eq('id', userIdToUpdate)
            .select()
            .single();
        
        if (error) {
            log('error', "Error updating user permissions in Supabase:", error.message);
            return { success: false, error: error.message };
        }
        log('info', `Permissions updated for user ID ${userIdToUpdate}.`);
        if (currentUser?.id === userIdToUpdate) {
           setCurrentUserGlobally(data); 
           localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data));
        }
        if (refreshAdminUsersListCallback) await refreshAdminUsersListCallback();
        return { success: true, user: data };
    };

    return { login, addUser, updateUser, deleteUser, updateUserPermissions };
};
