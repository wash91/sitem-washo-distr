
import React from 'react';
import { initialProducts, initialTrucks, initialExpenseCategories, initialMockSales, initialMockCustomers, initialMockRefills, initialMockExpenses, initialMockCashOpenings, initialMockCashClosings, initialMockManagedOrders, initialMockAccountsReceivable, initialMockAppointments, initialMockTruckInventories } from './dataUtils.jsx';
import { v4 as uuidv4 } from 'uuid';

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[DataStorage-Local][${timestamp}] ${message}`, ...args);
};

const getLocalStorageKey = (tableName, userId = null, userSpecific = false) => {
    return `bijaoWaterApp_local_${userSpecific && userId ? userId + '_' : ''}${tableName}`;
};

export const loadInitialData = async (setters, userId) => {
    log('info', `Loading initial data locally. User ID: ${userId}`);

    const tableConfigs = [
        { name: 'products', setter: setters.setProducts, initial: initialProducts, userSpecific: false },
        { name: 'customers', setter: setters.setCustomers, initial: initialMockCustomers, userSpecific: true, userField: 'created_by' },
        { name: 'sales', setter: setters.setSales, initial: initialMockSales, userSpecific: true, userField: 'distributor_id' },
        { name: 'refills', setter: setters.setRefills, initial: initialMockRefills, userSpecific: true, userField: 'distributor_id' },
        { name: 'expenses', setter: setters.setExpenses, initial: initialMockExpenses, userSpecific: true, userField: 'distributor_id' },
        { name: 'expense_categories', setter: setters.setExpenseCategories, initial: initialExpenseCategories, userSpecific: false },
        { name: 'cash_openings', setter: setters.setCashOpenings, initial: initialMockCashOpenings, userSpecific: true, userField: 'distributor_id' },
        { name: 'cash_closings', setter: setters.setCashClosings, initial: initialMockCashClosings, userSpecific: true, userField: 'distributor_id' },
        { name: 'trucks', setter: setters.setTrucks, initial: initialTrucks, userSpecific: false },
        { name: 'managed_orders', setter: setters.setManagedOrders, initial: initialMockManagedOrders, userSpecific: true, userField: 'assigned_distributor_id' },
        { name: 'accounts_receivable', setter: setters.setAccountsReceivable, initial: initialMockAccountsReceivable, userSpecific: false },
        { name: 'appointments', setter: setters.setAppointments, initial: initialMockAppointments, userSpecific: true, userField: 'distributor_id' },
        { name: 'truck_inventories', setter: setters.setTruckInventories, initial: initialMockTruckInventories, userSpecific: false, isMap: true },
    ];

    for (const config of tableConfigs) {
        const localKey = getLocalStorageKey(config.name, userId, config.userSpecific);
        const localData = localStorage.getItem(localKey);
        let dataToSet;

        if (localData) {
            try {
                dataToSet = JSON.parse(localData);
                log('info', `Loaded ${config.name} from localStorage.`);
            } catch (e) {
                log('error', `Error parsing local data for ${localKey}, using initial.`, e);
                dataToSet = config.initial;
                localStorage.setItem(localKey, JSON.stringify(config.initial));
            }
        } else {
            dataToSet = config.initial;
            localStorage.setItem(localKey, JSON.stringify(config.initial));
            log('info', `No local data for ${config.name}, using initial and saving to localStorage.`);
        }
        
        if (config.userSpecific && userId && config.userField && Array.isArray(dataToSet)) {
             config.setter(dataToSet.filter(item => item[config.userField] === userId));
        } else if (config.userSpecific && userId && !Array.isArray(dataToSet) && typeof dataToSet === 'object' && dataToSet !== null && config.isMap) {
            const userFilteredMap = {};
            for (const key in dataToSet) {
                if(dataToSet[key][config.userField] === userId || !dataToSet[key][config.userField]) { 
                    userFilteredMap[key] = dataToSet[key];
                }
            }
            config.setter(userFilteredMap);
        }
        else {
            config.setter(dataToSet);
        }
    }
};


export const saveDataToSupabase = async (tableName, itemData, idField = 'id', userId = null, userSpecific = false, isMap = false, userField = null) => {
    log('info', `Simulating save locally for ${tableName}. Data:`, itemData);
    const localKey = getLocalStorageKey(tableName, userId, userSpecific);
    
    let currentLocalData;
    const stored = localStorage.getItem(localKey);

    if (isMap) {
        currentLocalData = stored ? JSON.parse(stored) : {};
    } else {
        currentLocalData = stored ? JSON.parse(stored) : [];
    }
    
    const dataToSaveArray = Array.isArray(itemData) ? itemData : [itemData];
    let updated = false;

    dataToSaveArray.forEach(singleItem => {
        const newItem = { ...singleItem };
        if (!newItem[idField]) newItem[idField] = uuidv4();
        if (userSpecific && userId && userField && !newItem[userField]) newItem[userField] = userId;


        if (isMap) {
            currentLocalData[newItem[idField]] = newItem;
            updated = true;
        } else if (Array.isArray(currentLocalData)) {
            const index = currentLocalData.findIndex(i => i[idField] === newItem[idField]);
            if (index !== -1) {
                currentLocalData[index] = newItem;
            } else {
                currentLocalData.push(newItem);
            }
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem(localKey, JSON.stringify(currentLocalData));
        log('info', `Locally saved ${tableName}.`);
        return { data: itemData, error: null };
    }
    return { data: itemData, error: { message: "Local data not array or map, or no change." } };
};


export const deleteDataFromSupabase = async (tableName, itemId, idField = 'id', userId = null, userSpecific = false, isMap = false) => {
    log('info', `Simulating delete locally for ${tableName} ID: ${itemId}.`);
    const localKey = getLocalStorageKey(tableName, userId, userSpecific);
    
    let currentLocalData;
    const stored = localStorage.getItem(localKey);

    if (isMap) {
        currentLocalData = stored ? JSON.parse(stored) : {};
    } else {
        currentLocalData = stored ? JSON.parse(stored) : [];
    }

    let updatedData;
    let found = false;

    if (isMap) {
        if (currentLocalData[itemId]) {
            delete currentLocalData[itemId];
            updatedData = currentLocalData;
            found = true;
        }
    } else if (Array.isArray(currentLocalData)) {
        const initialLength = currentLocalData.length;
        updatedData = currentLocalData.filter(item => item[idField] !== itemId);
        if (updatedData.length < initialLength) {
            found = true;
        }
    } else {
        return { error: { message: "Local data is not an array or map." } };
    }

    if (found) {
        localStorage.setItem(localKey, JSON.stringify(updatedData));
        log('info', `Locally deleted from ${tableName} ID: ${itemId}.`);
        return { error: null };
    }
    log('warn', `Item ID ${itemId} not found in local data for ${tableName}.`);
    return { error: {message: `Item ID ${itemId} not found locally.`} };
};
