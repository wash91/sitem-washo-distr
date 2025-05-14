
import React from 'react';
import { ROLES, allPermissionsList } from '@/context/authConstants';
import { v4 as uuidv4 } from 'uuid';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[MockUserUtils][${timestamp}] ${message}`, ...args);
};

export const getInitialMockUsers = () => {
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

export const getMockUsersFromStorage = () => {
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

export const saveMockUsersToStorage = (users) => {
    localStorage.setItem('bijaoWaterApp_mockUsers', JSON.stringify(users));
};
