
import React, { useMemo } from 'react';

export const useCrudFunctions = (createSaveDataFunction, createDeleteDataFunction, stateSetters) => {
    const {
        setSales, setCustomers, setProducts, setRefills, setExpenses,
        setExpenseCategories, setCashOpenings, setCashClosings, setTrucks,
        setTruckInventories, setManagedOrders, setAccountsReceivable, setAppointments
    } = stateSetters;

    return useMemo(() => ({
        setAndSaveSales: createSaveDataFunction('sales', setSales),
        deleteSale: createDeleteDataFunction('sales', setSales),
        setAndSaveCustomers: createSaveDataFunction('customers', setCustomers),
        deleteCustomer: createDeleteDataFunction('customers', setCustomers),
        setAndSaveProducts: createSaveDataFunction('products', setProducts),
        deleteProduct: createDeleteDataFunction('products', setProducts),
        setAndSaveRefills: createSaveDataFunction('refills', setRefills),
        deleteRefill: createDeleteDataFunction('refills', setRefills),
        setAndSaveExpenses: createSaveDataFunction('expenses', setExpenses),
        deleteExpense: createDeleteDataFunction('expenses', setExpenses),
        setAndSaveExpenseCategories: createSaveDataFunction('expense_categories', setExpenseCategories, 'name'),
        deleteExpenseCategory: createDeleteDataFunction('expense_categories', setExpenseCategories, 'name'),
        setAndSaveCashOpenings: createSaveDataFunction('cash_openings', setCashOpenings),
        setAndSaveCashClosings: createSaveDataFunction('cash_closings', setCashClosings),
        setAndSaveTrucks: createSaveDataFunction('trucks', setTrucks),
        deleteTruck: createDeleteDataFunction('trucks', setTrucks),
        setAndSaveTruckInventories: createSaveDataFunction('truck_inventories', setTruckInventories),
        setAndSaveManagedOrders: createSaveDataFunction('managed_orders', setManagedOrders),
        deleteManagedOrder: createDeleteDataFunction('managed_orders', setManagedOrders),
        setAndSaveAccountsReceivable: createSaveDataFunction('accounts_receivable', setAccountsReceivable),
        setAndSaveAppointments: createSaveDataFunction('appointments', setAppointments),
        deleteAppointment: createDeleteDataFunction('appointments', setAppointments),
    }), [
        createSaveDataFunction, createDeleteDataFunction,
        setSales, setCustomers, setProducts, setRefills, setExpenses,
        setExpenseCategories, setCashOpenings, setCashClosings, setTrucks,
        setTruckInventories, setManagedOrders, setAccountsReceivable, setAppointments
    ]);
};
