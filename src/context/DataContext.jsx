
import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useDataState } from '@/context/dataState';
import { useDataSync } from '@/context/dataSync';
import { useDistributorManagement } from '@/context/dataHooks/useDistributorManagement';
import { useEntityApis } from '@/context/dataHooks/useEntityApis';
import { useCrudFunctions } from '@/context/dataHooks/useCrudFunctions';

const DataContext = createContext(null);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData debe ser usado dentro de un DataProvider");
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const { toast } = useToast();
    const { user, loadingAuth } = useAuth();
    const state = useDataState();
    const userId = user?.id;

    const stateSettersForSync = useMemo(() => ({
        setProducts: state.setProducts,
        setCustomers: state.setCustomers,
        setSales: state.setSales,
        setRefills: state.setRefills,
        setExpenses: state.setExpenses,
        setExpenseCategories: state.setExpenseCategories,
        setCashOpenings: state.setCashOpenings,
        setCashClosings: state.setCashClosings,
        setTrucks: state.setTrucks,
        setManagedOrders: state.setManagedOrders,
        setAccountsReceivable: state.setAccountsReceivable,
        setAppointments: state.setAppointments,
        setTruckInventories: state.setTruckInventories,
        setIsDataLoaded: state.setIsDataLoaded,
        setLastSyncTimestamp: state.setLastSyncTimestamp,
        setIsReloading: state.setIsReloading,
        isDataLoaded: state.isDataLoaded,
    }), [
        state.setProducts, state.setCustomers, state.setSales, state.setRefills, state.setExpenses,
        state.setExpenseCategories, state.setCashOpenings, state.setCashClosings, state.setTrucks,
        state.setManagedOrders, state.setAccountsReceivable, state.setAppointments,
        state.setTruckInventories, state.setIsDataLoaded, state.setLastSyncTimestamp,
        state.setIsReloading, state.isDataLoaded
    ]);
    
    const { refreshDistributors } = useDistributorManagement(state.setDistributors, loadingAuth, user);
    const { reloadAllData, createSaveDataFunction, createDeleteDataFunction } = useDataSync(stateSettersForSync, refreshDistributors, loadingAuth, userId);
    
    const crudFunctions = useCrudFunctions(createSaveDataFunction, createDeleteDataFunction, stateSettersForSync);

    const entityApis = useEntityApis(user, state, crudFunctions, toast);

    useEffect(() => {
        if (state.isDataLoaded && user && entityApis?.expenseCategoryApi?.addExpenseCategory) {
            const hasAnticipo = state.expenseCategories.some(cat => cat.name === "Anticipo de Sueldo");
            if (!hasAnticipo) {
                const addDefaultCategory = async () => {
                    try {
                        await entityApis.expenseCategoryApi.addExpenseCategory("Anticipo de Sueldo");
                    } catch (error) {
                        console.error("Failed to add default expense category 'Anticipo de Sueldo':", error);
                    }
                };
                addDefaultCategory();
            }
        }
    }, [state.isDataLoaded, state.expenseCategories, user, entityApis]);

    const value = useMemo(() => ({
        sales: state.sales, ...entityApis.salesApi,
        customers: state.customers, ...entityApis.customerApi,
        products: state.products, ...entityApis.productApi, 
        refills: state.refills, ...entityApis.refillApi,
        expenses: state.expenses, ...entityApis.expenseApi,
        expenseCategories: state.expenseCategories, ...entityApis.expenseCategoryApi,
        cashOpenings: state.cashOpenings, ...entityApis.cashOpeningApi,
        cashClosings: state.cashClosings, ...entityApis.cashClosingApi,
        trucks: state.trucks, ...entityApis.truckApi,
        truckInventories: state.truckInventories, ...entityApis.truckInventoryApi, 
        managedOrders: state.managedOrders, ...entityApis.managedOrderApi,
        distributors: state.distributors,
        accountsReceivable: state.accountsReceivable, ...entityApis.accountsReceivableApi,
        appointments: state.appointments, ...entityApis.appointmentApi,
        reloadAllData, 
        isDataLoaded: state.isDataLoaded,
        setProducts: crudFunctions.setAndSaveProducts,
        setTruckInventories: crudFunctions.setAndSaveTruckInventories,
        isLoading: state.isReloading || loadingAuth,
    }), [
        state.sales, state.customers, state.products, state.refills, state.expenses,
        state.expenseCategories, state.cashOpenings, state.cashClosings, state.trucks,
        state.truckInventories, state.managedOrders, state.distributors,
        state.accountsReceivable, state.appointments,
        entityApis, crudFunctions, reloadAllData, state.isDataLoaded, state.isReloading, loadingAuth
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
