
import { useState } from 'react';

export const useDataState = () => {
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [refills, setRefills] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [cashOpenings, setCashOpenings] = useState([]);
    const [cashClosings, setCashClosings] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [truckInventories, setTruckInventories] = useState({});
    const [managedOrders, setManagedOrders] = useState([]);
    const [distributors, setDistributors] = useState([]);
    const [accountsReceivable, setAccountsReceivable] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [lastSyncTimestamp, setLastSyncTimestamp] = useState(0);
    const [isReloading, setIsReloading] = useState(false);

    return {
        sales, setSales,
        customers, setCustomers,
        products, setProducts,
        refills, setRefills,
        expenses, setExpenses,
        expenseCategories, setExpenseCategories,
        cashOpenings, setCashOpenings,
        cashClosings, setCashClosings,
        trucks, setTrucks,
        truckInventories, setTruckInventories,
        managedOrders, setManagedOrders,
        distributors, setDistributors,
        accountsReceivable, setAccountsReceivable,
        appointments, setAppointments,
        isDataLoaded, setIsDataLoaded,
        lastSyncTimestamp, setLastSyncTimestamp,
        isReloading, setIsReloading,
    };
};
