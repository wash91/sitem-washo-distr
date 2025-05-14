
import { v4 as uuidv4 } from 'uuid';

export const truckHandler = (trucks, setAndSaveTrucks, truckInventories, setAndSaveTruckInventories, toast, deleteTruckSupabase) => {
    const addTruck = async (truckData) => {
        const newTruck = { 
            id: uuidv4(), 
            ...truckData,
            created_at: new Date().toISOString(),
        };
        const { data: result, error } = await setAndSaveTrucks(prev => [...prev, newTruck]);
        if (error) {
            toast({ title: "Error", description: `No se pudo agregar el camión. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Camión Agregado", description: `Camión con placa ${newTruck.plate} agregado.` });
        }
        return { data: result ? result.find(t => t.id === newTruck.id) : newTruck, error };
    };

    const updateTruck = async (truckId, updatedData) => {
        const truckToUpdate = { 
            ...updatedData, 
            id: truckId, 
        };
        const { data: result, error } = await setAndSaveTrucks(prev => 
            prev.map(t => t.id === truckId ? { ...t, ...truckToUpdate } : t)
        );
        if (error) {
            toast({ title: "Error", description: `No se pudo actualizar el camión. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Camión Actualizado", description: "Datos del camión actualizados." });
        }
        return { data: result ? result.find(t => t.id === truckId) : truckToUpdate, error };
    };
    
    const deleteTruck = async (truckId) => {
        // Consider implications: what happens to truck_inventories linked to this truck?
        // Supabase schema might use ON DELETE CASCADE or restrict deletion.
        const { error } = await deleteTruckSupabase(truckId);
         if (error) {
            toast({ title: "Error", description: `No se pudo eliminar el camión. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Camión Eliminado", description: "El camión ha sido eliminado.", variant: "destructive" });
            // Also clear related truck inventory from local state if needed
            // This might be complex if truckInventories is a flat list. 
            // If it's an object keyed by truckId, it's easier.
        }
        return { error };
    };

    const assignProductsToTruck = async (truckId, productUpdates) => {
        // productUpdates: [{ product_id, quantity }]
        // This would involve multiple upserts to truck_inventories table
        const updates = productUpdates.map(item => ({
            truck_id: truckId,
            product_id: item.product_id,
            quantity: item.quantity,
            last_updated: new Date().toISOString()
        }));

        // Assuming setAndSaveTruckInventories handles batch upserts or individual items
        // This is a placeholder for actual Supabase interaction.
        const { error } = await setAndSaveTruckInventories(prev => {
            const newInventories = { ...prev };
            updates.forEach(update => {
                // This logic needs to be more robust if prev is an array.
                // Assuming prev is an object keyed by truck_id, then product_id
                if (!newInventories[truckId]) newInventories[truckId] = {};
                newInventories[truckId][update.product_id] = update.quantity;
            });
            return newInventories; // This state structure for truckInventories might need rethinking for Supabase
        });

        if (error) {
            toast({ title: "Error", description: `No se pudo actualizar el inventario del camión. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Inventario Actualizado", description: `Inventario del camión ${truckId} actualizado.` });
        }
        return { error };
    };


    return {
        addTruck,
        updateTruck,
        deleteTruck,
        assignProductsToTruck,
        getAllTrucks: () => trucks
    };
};
