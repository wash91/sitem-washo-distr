
import React from 'react';
import { ROLES, allPermissionsList } from '@/context/authConstants.jsx';

export const LOCAL_STORAGE_USER_KEY = 'bijaoWaterApp_authUser';
export const MOCK_USERS_STORAGE_KEY = 'bijaoWaterApp_mockUsers';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[LocalUserStorage][${timestamp}] ${message}`, ...args);
};

export const getInitialMockUsers = () => {
    const mockAdmin = {
        id: 'admin-mock-id',
        name: 'Admin Bijao (Local)',
        email: 'admin@bijao.com',
        role: ROLES.ADMIN,
        permissions: allPermissionsList.map(p => p.id),
        created_at: new Date().toISOString(),
        password_hash: 'adminpassword', 
    };
    const mockDistributor = {
        id: 'distributor-mock-id',
        name: 'Distribuidor Ejemplo (Local)',
        email: 'distributor@example.com',
        role: ROLES.DISTRIBUTOR,
        permissions: ['viewDistributorDashboard', 'manageSales', 'manageCustomers', 'viewTruckInventory'],
        created_at: new Date().toISOString(),
        password_hash: 'distributorpassword',
    };
    const santiagoRobles = {
        id: 'santiago-robles-mock-id',
        name: 'Santiago Robles',
        email: 'santiago@bijao.com',
        role: ROLES.DISTRIBUTOR,
        permissions: ['viewDistributorDashboard', 'manageSales', 'manageCustomers', 'viewTruckInventory', 'manageCashOpenings', 'manageCashClosings', 'manageRefills', 'manageExpenses', 'manageAppointments', 'manageReceivables', 'viewAssignedOrders'],
        created_at: new Date().toISOString(),
        password_hash: 'SANTIAGO2025',
    };
    return [mockAdmin, mockDistributor, santiagoRobles];
};

export const getMockUsersFromStorage = () => {
    const storedUsers = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
    if (storedUsers) {
        try {
            const parsedUsers = JSON.parse(storedUsers);
            if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
                
                const initialUsersTemplate = getInitialMockUsers();
                let usersUpdated = false;

                initialUsersTemplate.forEach(templateUser => {
                    if (!parsedUsers.find(existingUser => existingUser.email === templateUser.email)) {
                        parsedUsers.push(templateUser);
                        usersUpdated = true;
                    }
                });

                if (usersUpdated) {
                    saveMockUsersToStorage(parsedUsers);
                }
                return parsedUsers;
            }
        } catch (e) {
            log('error', "Error parsing mock users from localStorage", e);
            localStorage.removeItem(MOCK_USERS_STORAGE_KEY); 
        }
    }
    const initialUsers = getInitialMockUsers();
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    return initialUsers;
};

export const saveMockUsersToStorage = (users) => {
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
};
