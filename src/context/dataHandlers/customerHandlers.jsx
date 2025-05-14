
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';

export const customerHandler = (customers, setAndSaveCustomers, toast, deleteCustomerSupabase, currentUserId) => {
    const addCustomer = async (customerData) => {
        const newCustomer = { 
            id: uuidv4(), 
            ...customerData, 
            debt: customerData.debt || 0,
            created_by: currentUserId, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        
        const { data: result, error } = await setAndSaveCustomers(prev => [...prev, newCustomer]);
        if (error) {
            toast({ title: "Error", description: "No se pudo agregar el cliente. " + error.message, variant: "destructive" });
        } else {
            toast({ title: "Cliente Agregado", description: `${newCustomer.name} ha sido agregado.` });
        }
        return { data: result ? result.find(c => c.id === newCustomer.id) : newCustomer, error };
    };

    const updateCustomer = async (customerId, updatedData) => {
        const customerToUpdate = { 
            ...updatedData, 
            id: customerId, 
            updated_at: new Date().toISOString() 
        };
        const { data: result, error } = await setAndSaveCustomers(prev => 
            prev.map(c => c.id === customerId ? { ...c, ...customerToUpdate } : c)
        );
        if (error) {
            toast({ title: "Error", description: "No se pudo actualizar el cliente. " + error.message, variant: "destructive" });
        } else {
            toast({ title: "Cliente Actualizado", description: "Datos del cliente actualizados." });
        }
        return { data: result ? result.find(c => c.id === customerId) : customerToUpdate, error };
    };
    
    const deleteCustomer = async (customerId) => {
        const { error } = await deleteCustomerSupabase(customerId);
        if (error) {
            toast({ title: "Error", description: "No se pudo eliminar el cliente. " + error.message, variant: "destructive" });
        } else {
            toast({ title: "Cliente Eliminado", description: "El cliente ha sido eliminado.", variant: "destructive" });
        }
        return { error };
    };
    
    const getCustomerById = (customerId) => {
        return customers.find(c => c.id === customerId);
    };

    return {
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        getAllCustomers: () => customers
    };
};
