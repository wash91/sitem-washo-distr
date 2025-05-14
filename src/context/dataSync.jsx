
import React from 'react';
import { useEffect } from 'react';
import { useDataOperations } from './dataOperations.jsx'; 
import { useAuth } from '@/context/AuthContext';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[DataSync-Local][${timestamp}] ${message}`, ...args);
};

export const useDataSync = (stateSetters, refreshDistributorsCallback, isLoadingAuth, currentUserId) => {
    const { isDataLoaded } = stateSetters;
    const { user } = useAuth();
    const userIdToUse = currentUserId || user?.id;

    const { 
        reloadAllData, 
        createSaveDataFunction, 
        createDeleteDataFunction 
    } = useDataOperations(stateSetters, refreshDistributorsCallback, isLoadingAuth, currentUserId);

    useEffect(() => {
        if (!isLoadingAuth && userIdToUse && !isDataLoaded) {
            log('info', `Initial data load trigger. User ID: ${userIdToUse}`);
            reloadAllData();
        }
    }, [isLoadingAuth, userIdToUse, isDataLoaded, reloadAllData]);

    return { reloadAllData, createSaveDataFunction, createDeleteDataFunction };
};
