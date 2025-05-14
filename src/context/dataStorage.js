
import { supabase } from '@/lib/supabaseClient';
import { initialProducts as defaultInitialProducts, initialCustomers, initialTrucks } from '@/context/dataUtils';

const initialProducts = [...defaultInitialProducts];


export const loadInitialData = async (setters, userId) => {
    const {
        setSales, setCustomers, setProducts, setRefills, setExpenses,
        setExpenseCategories, setCashOpenings, setCashClosings,
        setTrucks, setTruckInventories, setManagedOrders, setAccountsReceivable,
        setAppointments
    } = setters;

    const commonQuery = (tableName, setter, defaultValue = [], userSpecificField = null) => {
        let query = supabase.from(tableName).select('*');
        if (userSpecificField && userId) {
            query = query.eq(userSpecificField, userId);
        }
        return query.then(({ data, error }) => {
            if (error) {
                console.error(`Error loading ${tableName}:`, error);
                setter(defaultValue);
            } else {
                setter(data || defaultValue);
            }
        });
    };
    
    const fetchProducts = async () => {
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
            console.error('Error loading products:', error);
            setProducts(initialProducts);
        } else {
            if (data && data.length > 0) {
                setProducts(data);
            } else {
                console.log('No products found in DB, seeding initial products...');
                const { error: insertError } = await supabase.from('products').insert(initialProducts.map(p => ({...p, id: undefined }))); // Let Supabase generate IDs
                if (insertError) {
                    console.error('Error seeding initial products:', insertError);
                    setProducts(initialProducts); 
                } else {
                    const { data: seededData } = await supabase.from('products').select('*');
                    setProducts(seededData || initialProducts);
                }
            }
        }
    };

    const fetchCustomers = async () => {
         let query = supabase.from('customers').select('*');
         if(userId) {
             query = query.or(`created_by.eq.${userId},type.eq.negocio`); // Distributors see their own customers + all businesses
         }
        const { data, error } = await query;
        if (error) {
            console.error('Error loading customers:', error);
            setCustomers(initialCustomers);
        } else {
            setCustomers(data || initialCustomers);
        }
    };
    
    const fetchExpenseCategories = async () => {
        const { data, error } = await supabase.from('expense_categories').select('*');
        if (error) {
            console.error('Error loading expense categories:', error);
            setExpenseCategories(["gasolina", "peaje", "comida", "repuestos", "otros"].map(name => ({name}))); // simplified default
        } else {
            setExpenseCategories(data || ["gasolina", "peaje", "comida", "repuestos", "otros"].map(name => ({name})));
        }
    };


    await Promise.all([
        commonQuery('sales', setSales, [], userId ? 'distributor_id' : null),
        fetchCustomers(),
        fetchProducts(),
        commonQuery('refills', setRefills, [], userId ? 'distributor_id' : null),
        commonQuery('expenses', setExpenses, [], userId ? 'distributor_id' : null),
        fetchExpenseCategories(),
        commonQuery('cash_openings', setCashOpenings, [], userId ? 'distributor_id' : null),
        commonQuery('cash_closings', setCashClosings, [], userId ? 'distributor_id' : null),
        commonQuery('trucks', setTrucks, initialTrucks),
        commonQuery('truck_inventories', setTruckInventories, {}), // This might need adjustment based on structure
        commonQuery('managed_orders', setManagedOrders, [], userId ? 'assigned_distributor_id' : null),
        commonQuery('accounts_receivable', setAccountsReceivable, [], null), // Complex RLS handles this
        commonQuery('appointments', setAppointments, [], userId ? 'distributor_id' : null)
    ]);
};

export const saveDataToSupabase = async (tableName, data, idField = 'id') => {
    if (!data) return { error: { message: "No data provided to save."}};
    
    const dataToUpsert = Array.isArray(data) ? data : [data];
    if (dataToUpsert.length === 0) return { data: [] };

    const upsertObjects = dataToUpsert.map(item => {
        const { created_at, updated_at, ...rest } = item; // Supabase handles these
        return { ...rest, [idField]: item[idField] || undefined }; // Ensure ID is present or undefined for insert
    });
    
    const { data: result, error } = await supabase
        .from(tableName)
        .upsert(upsertObjects, { onConflict: idField, defaultToNull: false })
        .select();

    if (error) {
        console.error(`Error saving to ${tableName}:`, error);
    }
    return { data: result, error };
};

export const deleteDataFromSupabase = async (tableName, id) => {
    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error(`Error deleting from ${tableName} (ID: ${id}):`, error);
    }
    return { error };
};
