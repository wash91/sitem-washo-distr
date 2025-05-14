
import React from 'react';
import { useCallback } from 'react';
import { loadInitialData, saveDataToSupabase, deleteDataFromSupabase } from './dataStorage.jsx';
import { useAuth } from '@/context/AuthContext';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[DataOperations-Local][${timestamp}] ${message}`, ...args);
};

export const useDataOperations = (stateSetters, refreshDistributorsCallback, isLoadingAuth, currentUserId) => {
    const { isDataLoaded, setIsDataLoaded, setLastSyncTimestamp, setIsReloading } = stateSetters;
    const { user } = useAuth();
    const userIdToUse = currentUserId || user?.id;

    const tableConfigs = {
        products: { userSpecific: false, idField: 'id' },
        customers: { userSpecific: true, userField: 'created_by', idField: 'id' },
        sales: { userSpecific: true, userField: 'distributor_id', idField: 'id' },
        refills: { userSpecific: true, userField: 'distributor_id', idField: 'id' },
        expenses: { userSpecific: true, userField: 'distributor_id', idField: 'id' },
        expense_categories: { userSpecific: false, idField: 'id' },
        cash_openings: { userSpecific: true, userField: 'distributor_id', idField: 'id' },
        cash_closings: { userSpecific: true, userField: 'distributor_id', idField: 'id' },
        trucks: { userSpecific: false, idField: 'id' },
        managed_orders: { userSpecific: true, userField: 'assigned_distributor_id', idField: 'id' },
        accounts_receivable: { userSpecific: false, idField: 'id' },
        appointments: { userSpecific: true, userField: 'distributor_id', idField: 'id' },
        truck_inventories: { userSpecific: false, idField: 'truck_id_product_id', isMap: true, userField: null },
    };

    const reloadAllData = useCallback(async (force = false) => {
        if ((!isDataLoaded || force) && !isLoadingAuth && userIdToUse) {
            log('info', `Reloading all data. User ID: ${userIdToUse}. Force: ${force}`);
            setIsReloading(true);
            await loadInitialData(stateSetters, userIdToUse);
            if (refreshDistributorsCallback) {
                await refreshDistributorsCallback();
            }
            setIsDataLoaded(true);
            setLastSyncTimestamp(Date.now());
            setIsReloading(false);
            log('info', `Data reload complete for User ID: ${userIdToUse}.`);
        } else if (!userIdToUse && !isLoadingAuth) {
             log('warn', "Cannot reload data: No user ID available and auth is not loading.");
        } else if (isLoadingAuth) {
            log('info', "Auth is loading, data reload will be skipped or deferred.");
        }
    }, [isDataLoaded, isLoadingAuth, userIdToUse, stateSetters, refreshDistributorsCallback, setIsDataLoaded, setLastSyncTimestamp, setIsReloading]);

    const createSaveDataFunction = useCallback((tableName) => {
        const config = tableConfigs[tableName];
        if (!config) {
            log('error', `No config found for table ${tableName} in createSaveDataFunction`);
            return async () => ({ error: { message: `Invalid table ${tableName}` } });
        }
        return async (data) => {
            log('info', `Saving data to ${tableName} locally. Data:`, data);
            const result = await saveDataToSupabase(
                tableName, 
                data, 
                config.idField, 
                userIdToUse, 
                config.userSpecific,
                config.isMap,
                config.userField
            );
            if (!result.error) {
                await reloadAllData(true); 
            }
            return result;
        };
    }, [userIdToUse, reloadAllData]);

    const createDeleteDataFunction = useCallback((tableName) => {
        const config = tableConfigs[tableName];
        if (!config) {
            log('error', `No config found for table ${tableName} in createDeleteDataFunction`);
            return async () => ({ error: { message: `Invalid table ${tableName}` } });
        }
        return async (id) => {
            log('info', `Deleting data from ${tableName} locally. ID: ${id}`);
            const result = await deleteDataFromSupabase(
                tableName, 
                id, 
                config.idField, 
                userIdToUse, 
                config.userSpecific,
                config.isMap
            );
            if (!result.error) {
                await reloadAllData(true);
            }
            return result;
        };
    }, [userIdToUse, reloadAllData]);

    return { reloadAllData, createSaveDataFunction, createDeleteDataFunction };
};
