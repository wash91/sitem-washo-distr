
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ROLES } from '@/context/authConstants.jsx';
import { 
    getMockUsersFromStorage, 
    saveMockUsersToStorage, 
    LOCAL_STORAGE_USER_KEY 
} from '@/context/auth/localUserStorage.jsx';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[LocalUserCrud][${timestamp}] ${message}`, ...args);
};

export const localLogin = (email, password, setCurrentUserGlobally) => {
    log('info', `Local Mode: Attempting login for ${email}.`);
    const mockUsers = getMockUsersFromStorage();
    const foundUser = mockUsers.find(u => u.email === email);

    if (foundUser && foundUser.password_hash === password) {
        const userToStore = { ...foundUser };
        delete userToStore.password_hash;
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userToStore));
        setCurrentUserGlobally(userToStore);
        log('info', `Local Mode: Login successful for ${email}.`);
        return { success: true, user: userToStore };
    }
    
    log('warn', `Local Mode: Login failed for ${email}. Invalid credentials or user not found.`);
    return { success: false, error: "Credenciales inválidas (local)." };
};

export const localAddUser = (userData, password, refreshAdminUsersListCallback) => {
    log('info', `Local Mode: Attempting to add user: ${userData.email}.`);
    const mockUsers = getMockUsersFromStorage();
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
        log('warn', `Local Mode: User add failed. Email ${userData.email} already exists.`);
        return { success: false, error: "El correo electrónico ya está en uso (local)." };
    }
    const newUser = { 
        ...userData, 
        id: uuidv4(), 
        created_at: new Date().toISOString(), 
        password_hash: password,
        permissions: userData.permissions || (userData.role === ROLES.DISTRIBUTOR ? ['viewDistributorDashboard', 'manageSales', 'manageCustomers', 'viewTruckInventory'] : [])
    };
    mockUsers.push(newUser);
    saveMockUsersToStorage(mockUsers);
    if (refreshAdminUsersListCallback) {
        log('info', `Local Mode: Calling refreshAdminUsersListCallback after adding user ${userData.email}.`);
        refreshAdminUsersListCallback();
    }
    log('info', `Local Mode: User ${userData.email} added successfully.`);
    const userToReturn = {...newUser};
    delete userToReturn.password_hash;
    return { success: true, user: userToReturn };
};

export const localUpdateUser = (userIdToUpdate, updatedData, currentUser, setCurrentUserGlobally, refreshAdminUsersListCallback) => {
    log('info', `Local Mode: Attempting to update user: ${userIdToUpdate}.`);
    let mockUsers = getMockUsersFromStorage();
    const userIndex = mockUsers.findIndex(u => u.id === userIdToUpdate);

    if (userIndex !== -1) {
        const oldEmail = mockUsers[userIndex].email;
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedData };
        
        if(updatedData.password && updatedData.password.trim() !== "") {
            mockUsers[userIndex].password_hash = updatedData.password;
            log('info', `Local Mode: Password updated for user ${userIdToUpdate}.`);
        }
        delete mockUsers[userIndex].password; 

        saveMockUsersToStorage(mockUsers);
        const userToStore = { ...mockUsers[userIndex] };
        delete userToStore.password_hash;

        if (currentUser?.id === userIdToUpdate) {
             setCurrentUserGlobally(userToStore);
             localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userToStore));
             log('info', `Local Mode: Current user ${currentUser.email} updated and session refreshed.`);
        }
        if (refreshAdminUsersListCallback) {
            log('info', `Local Mode: Calling refreshAdminUsersListCallback after updating user ${oldEmail} (ID: ${userIdToUpdate}).`);
            refreshAdminUsersListCallback();
        }
        log('info', `Local Mode: User ${oldEmail} (ID: ${userIdToUpdate}) updated successfully. New email: ${mockUsers[userIndex].email}`);
        return { success: true, user: userToStore };
    }
    log('warn', `Local Mode: User update failed. User ${userIdToUpdate} not found.`);
    return { success: false, error: "Usuario no encontrado para actualizar (local)." };
};

export const localDeleteUser = (userIdToDelete, currentUser, logoutCallback, refreshAdminUsersListCallback) => {
    log('info', `Local Mode: Attempting to delete user: ${userIdToDelete}.`);
    let mockUsers = getMockUsersFromStorage();
    const initialLength = mockUsers.length;
    const userToDelete = mockUsers.find(u => u.id === userIdToDelete);
    
    mockUsers = mockUsers.filter(u => u.id !== userIdToDelete);

    if (mockUsers.length < initialLength) {
        saveMockUsersToStorage(mockUsers);
         if (currentUser?.id === userIdToDelete && logoutCallback) {
            log('info', `Local Mode: Current user ${currentUser.email} deleted. Logging out.`);
            logoutCallback();
        }
        if (refreshAdminUsersListCallback) {
            log('info', `Local Mode: Calling refreshAdminUsersListCallback after deleting user ${userToDelete?.email || userIdToDelete}.`);
            refreshAdminUsersListCallback();
        }
        log('info', `Local Mode: User ${userToDelete?.email || userIdToDelete} deleted successfully.`);
        return { success: true };
    }
    log('warn', `Local Mode: User delete failed. User ${userIdToDelete} not found.`);
    return { success: false, error: "Usuario no encontrado para eliminar (local)." };
};

export const localUpdateUserPermissions = (userIdToUpdate, newPermissions, currentUser, setCurrentUserGlobally, refreshAdminUsersListCallback) => {
    log('info', `Local Mode: Attempting to update permissions for user: ${userIdToUpdate}.`);
    let mockUsers = getMockUsersFromStorage();
    const userIndex = mockUsers.findIndex(u => u.id === userIdToUpdate);

    if (userIndex !== -1) {
        mockUsers[userIndex].permissions = newPermissions;
        saveMockUsersToStorage(mockUsers);
        const userToStore = { ...mockUsers[userIndex] };
        delete userToStore.password_hash;

        if (currentUser?.id === userIdToUpdate) {
             setCurrentUserGlobally(userToStore);
             localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userToStore));
             log('info', `Local Mode: Current user ${currentUser.email} permissions updated and session refreshed.`);
        }
        if (refreshAdminUsersListCallback) {
            log('info', `Local Mode: Calling refreshAdminUsersListCallback after updating permissions for user ${mockUsers[userIndex].email}.`);
            refreshAdminUsersListCallback();
        }
        log('info', `Local Mode: Permissions for user ${mockUsers[userIndex].email} updated successfully.`);
        return { success: true, user: userToStore };
    }
    log('warn', `Local Mode: Permission update failed. User ${userIdToUpdate} not found.`);
    return { success: false, error: "Usuario no encontrado para actualizar permisos (local)." };
};
