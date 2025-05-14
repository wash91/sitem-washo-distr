
import React from 'react';
import { 
    localLogin, 
    localAddUser, 
    localUpdateUser, 
    localDeleteUser, 
    localUpdateUserPermissions 
} from '@/context/auth/localUserCrud.jsx';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[AuthManagement][${timestamp}] ${message}`, ...args);
};

export const useUserManagement = (currentUser, setCurrentUserGlobally, fetchUserProfileGlobally, refreshAdminUsersListCallback) => {
    
    const login = async (email, password) => {
        log('info', `Attempting login for ${email}`);
        const result = await localLogin(email, password, setCurrentUserGlobally);
        if (result.success) {
            log('info', `Login successful for ${email}`);
        } else {
            log('warn', `Login failed for ${email}: ${result.error}`);
        }
        return result;
    };

    const addUser = async (userData, password) => {
        log('info', `Attempting to add user: ${userData.email}`);
        const result = await localAddUser(userData, password, refreshAdminUsersListCallback);
        if (result.success) {
            log('info', `User ${userData.email} added successfully.`);
        } else {
            log('warn', `Failed to add user ${userData.email}: ${result.error}`);
        }
        return result;
    };
    
    const updateUser = async (userIdToUpdate, updatedData) => {
        log('info', `Attempting to update user: ${userIdToUpdate}`);
        const result = await localUpdateUser(userIdToUpdate, updatedData, currentUser, setCurrentUserGlobally, refreshAdminUsersListCallback);
        if (result.success) {
            log('info', `User ${userIdToUpdate} updated successfully.`);
        } else {
            log('warn', `Failed to update user ${userIdToUpdate}: ${result.error}`);
        }
        return result;
    };

    const deleteUser = async (userIdToDelete, logoutCallback) => {
       log('info', `Attempting to delete user: ${userIdToDelete}`);
       const result = await localDeleteUser(userIdToDelete, currentUser, logoutCallback, refreshAdminUsersListCallback);
       if (result.success) {
           log('info', `User ${userIdToDelete} deleted successfully.`);
       } else {
           log('warn', `Failed to delete user ${userIdToDelete}: ${result.error}`);
       }
       return result;
    };

    const updateUserPermissions = async (userIdToUpdate, newPermissions) => {
        log('info', `Attempting to update permissions for user: ${userIdToUpdate}`);
        const result = await localUpdateUserPermissions(userIdToUpdate, newPermissions, currentUser, setCurrentUserGlobally, refreshAdminUsersListCallback);
        if (result.success) {
            log('info', `Permissions for user ${userIdToUpdate} updated successfully.`);
        } else {
            log('warn', `Failed to update permissions for user ${userIdToUpdate}: ${result.error}`);
        }
        return result;
    };

    return { login, addUser, updateUser, deleteUser, updateUserPermissions };
};
