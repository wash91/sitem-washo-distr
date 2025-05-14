
import { useCallback, useEffect, useMemo } from 'react';
import { loadInitialData, saveDataToSupabase as genericSaveData, deleteDataFromSupabase as genericDeleteData } from '@/context/dataStorage';
import { supabase } from '@/lib/supabaseClient';

const SYNC_INTERVAL_MS = 60000; 

export const useDataSync = (state, refreshDistributors, loadingAuth, userId) => {

    const reloadAllData = useCallback(async (forceReload = false, source = 'internal') => {
        if (state.isReloading && !forceReload) {
            console.log(`Reload already in progress (source: ${source}), skipping.`);
            return;
        }
        state.setIsReloading(true);
        console.log(`[SYNC-DB] Starting reloadAllData. Source: ${source}, Forced: ${forceReload}`);

        const now = Date.now();
        
        if (forceReload || now - state.lastSyncTimestamp > SYNC_INTERVAL_MS) {
            console.log(`[SYNC-DB] Reloading all data conditions met. Source: ${source}, Forced: ${forceReload}, Time since last: ${now - state.lastSyncTimestamp}ms`);
            
            await loadInitialData({
                setSales: state.setSales,
                setCustomers: state.setCustomers,
                setProducts: state.setProducts,
                setRefills: state.setRefills,
                setExpenses: state.setExpenses,
                setExpenseCategories: state.setExpenseCategories,
                setCashOpenings: state.setCashOpenings,
                setCashClosings: state.setCashClosings,
                setTrucks: state.setTrucks,
                setTruckInventories: state.setTruckInventories,
                setManagedOrders: state.setManagedOrders,
                setAccountsReceivable: state.setAccountsReceivable,
                setAppointments: state.setAppointments
            }, userId);
            
            if (refreshDistributors) refreshDistributors();
            
            state.setIsDataLoaded(true);
            state.setLastSyncTimestamp(now);
            console.log(`[SYNC-DB] Data reloaded. New lastSyncTimestamp: ${now}`);
        } else {
            console.log(`[SYNC-DB] Data is recent (source: ${source}), skipping full reload. Last sync: ${state.lastSyncTimestamp}, Now: ${now}`);
            if (!state.isDataLoaded) state.setIsDataLoaded(true);
        }
        state.setIsReloading(false);
    }, [state, refreshDistributors, userId]);

    useEffect(() => {
        if (!loadingAuth && userId) { // Only load if user is authenticated
            reloadAllData(true, 'initial_load_or_auth_change');
        } else if (!loadingAuth && !userId) { // User logged out, clear data
            state.setIsDataLoaded(false); 
            // Optionally clear all state arrays here if desired for faster UI reset
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !loadingAuth && userId) {
                console.log("[SYNC-DB] Tab became visible, triggering reload check.");
                reloadAllData(false, 'visibility_change');
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        const intervalId = setInterval(() => {
             if (document.visibilityState === 'visible' && !loadingAuth && userId) {
                console.log("[SYNC-DB] Interval check, triggering reload.");
                reloadAllData(false, 'interval_check');
             }
        }, SYNC_INTERVAL_MS + 5000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(intervalId);
        };
    }, [reloadAllData, loadingAuth, userId, state.setIsDataLoaded]);


    const createSaveDataFunction = useCallback((tableName, setter, idField = 'id') => async (dataUpdater) => {
        let oldDataJSON;
        let newDataToSave;
    
        setter(prevData => {
            oldDataJSON = JSON.stringify(prevData);
            const updatedData = typeof dataUpdater === 'function' ? dataUpdater(prevData) : dataUpdater;
            newDataToSave = updatedData;
            return updatedData;
        });
    
        if (JSON.stringify(newDataToSave) === oldDataJSON) {
            console.log(`[SYNC-DB] No actual change in data for ${tableName}, skipping save.`);
            return { data: newDataToSave, error: null }; // Or return prevData if newDataToSave is undefined
        }
    
        if (newDataToSave !== undefined) {
            console.log(`[SYNC-DB] Saving data for ${tableName}...`);
            const { data: result, error } = await genericSaveData(tableName, newDataToSave, idField);
            if (error) {
                console.error(`[SYNC-DB] Error saving ${tableName}:`, error.message);
                // Optionally revert state or show error to user
                // For now, we keep the optimistic update in state
                return { data: newDataToSave, error };
            }
            console.log(`[SYNC-DB] Successfully saved ${tableName}. Result:`, result);
            // Update state with data returned from Supabase (e.g., with generated IDs, timestamps)
            // This is important if Supabase modifies the data (e.g. adds created_at)
            // For simplicity, we'll assume the optimistic update is fine for now, but for robust apps,
            // you'd merge `result` back into your local state.
            // A full reload can also achieve this but might be too slow.
            // A targeted update of the setter with `result` would be best.
            // For example, if `result` is an array of updated items:
            if (result && Array.isArray(result)) {
                 setter(currentData => {
                    const dataMap = new Map(result.map(item => [item[idField], item]));
                    return currentData.map(item => dataMap.get(item[idField]) || item);
                 });
            } else if (result && !Array.isArray(result)) { // Single item update
                setter(currentData => {
                    if (Array.isArray(currentData)) {
                        return currentData.map(item => item[idField] === result[idField] ? result : item);
                    }
                    return result; // If state is a single object
                });
            }

            state.setLastSyncTimestamp(Date.now()); // Update sync timestamp
            return { data: result || newDataToSave, error: null };
        }
        return { data: newDataToSave, error: { message: "newDataToSave was undefined." } };
    }, [state.setLastSyncTimestamp]);

    const createDeleteDataFunction = useCallback((tableName, setter, idField = 'id') => async (itemId) => {
        const { error } = await genericDeleteData(tableName, itemId);
        if (error) {
            console.error(`[SYNC-DB] Error deleting from ${tableName} (ID: ${itemId}):`, error.message);
            return { error };
        }
        setter(prevData => prevData.filter(item => item[idField] !== itemId));
        state.setLastSyncTimestamp(Date.now());
        console.log(`[SYNC-DB] Successfully deleted item ${itemId} from ${tableName}.`);
        return { error: null };
    }, [state.setLastSyncTimestamp]);
    
    return { reloadAllData, createSaveDataFunction, createDeleteDataFunction };
};
