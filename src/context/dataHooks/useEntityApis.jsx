
import React, { useMemo } from 'react';
import {
    salesHandler, customerHandler, productHandler, refillHandler, expenseHandler,
    expenseCategoryHandler, cashOpeningHandler, cashClosingHandler, truckHandler,
    truckInventoryHandler, managedOrderHandler, accountsReceivableHandler, appointmentHandler
} from '@/context/dataHandlers/index';

export const useEntityApis = (
    user,
    state,
    crudFunctions,
    toast
) => {
    const salesApi = useMemo(() => salesHandler(user, state.sales, crudFunctions.setAndSaveSales, state.customers, crudFunctions.setAndSaveCustomers, state.cashOpenings, state.truckInventories, crudFunctions.setAndSaveTruckInventories, state.managedOrders, crudFunctions.setAndSaveManagedOrders, state.accountsReceivable, crudFunctions.setAndSaveAccountsReceivable, toast, state.products, crudFunctions.setAndSaveProducts, crudFunctions.deleteSale), [user, state, crudFunctions, toast]);
    const customerApi = useMemo(() => customerHandler(state.customers, crudFunctions.setAndSaveCustomers, toast, crudFunctions.deleteCustomer, user?.id), [state.customers, crudFunctions, toast, user?.id]);
    const productApi = useMemo(() => productHandler(state.products, crudFunctions.setAndSaveProducts, toast, crudFunctions.deleteProduct), [state.products, crudFunctions, toast]);
    const refillApi = useMemo(() => refillHandler(user, state.products, state.refills, crudFunctions.setAndSaveRefills, crudFunctions.setAndSaveProducts, state.expenses, crudFunctions.setAndSaveExpenses, state.expenseCategories, crudFunctions.setAndSaveExpenseCategories, toast, crudFunctions.deleteRefill), [user, state, crudFunctions, toast]);
    const expenseApi = useMemo(() => expenseHandler(user, state.expenses, crudFunctions.setAndSaveExpenses, toast, crudFunctions.deleteExpense), [user, state.expenses, crudFunctions, toast]);
    const expenseCategoryApi = useMemo(() => expenseCategoryHandler(state.expenseCategories, crudFunctions.setAndSaveExpenseCategories, toast, crudFunctions.deleteExpenseCategory), [state.expenseCategories, crudFunctions, toast]);
    const cashOpeningApi = useMemo(() => cashOpeningHandler(user, state.cashOpenings, crudFunctions.setAndSaveCashOpenings, state.products, crudFunctions.setAndSaveProducts, state.truckInventories, crudFunctions.setAndSaveTruckInventories, toast), [user, state, crudFunctions, toast]);
    const cashClosingApi = useMemo(() => cashClosingHandler(user, state.cashClosings, crudFunctions.setAndSaveCashClosings, state.cashOpenings, toast), [user, state, crudFunctions, toast]);
    const truckApi = useMemo(() => truckHandler(state.trucks, crudFunctions.setAndSaveTrucks, state.truckInventories, crudFunctions.setAndSaveTruckInventories, toast, crudFunctions.deleteTruck), [state, crudFunctions, toast]);
    const truckInventoryApi = useMemo(() => truckInventoryHandler(state.cashOpenings, state.truckInventories, state.products), [state.cashOpenings, state.truckInventories, state.products]);
    const managedOrderApi = useMemo(() => managedOrderHandler(user, state.managedOrders, crudFunctions.setAndSaveManagedOrders, toast, state.distributors, crudFunctions.deleteManagedOrder), [user, state, crudFunctions, toast]);
    const accountsReceivableApi = useMemo(() => accountsReceivableHandler(state.accountsReceivable, crudFunctions.setAndSaveAccountsReceivable, toast), [state.accountsReceivable, crudFunctions, toast]);
    const appointmentApi = useMemo(() => appointmentHandler(user, state.appointments, crudFunctions.setAndSaveAppointments, toast, crudFunctions.deleteAppointment), [user, state.appointments, crudFunctions, toast]);

    return {
        salesApi, customerApi, productApi, refillApi, expenseApi, expenseCategoryApi,
        cashOpeningApi, cashClosingApi, truckApi, truckInventoryApi, managedOrderApi,
        accountsReceivableApi, appointmentApi
    };
};
