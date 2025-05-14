
import { v4 as uuidv4 } from 'uuid';

export const cashOpeningHandler = (
    user, 
    cashOpenings, setAndSaveCashOpenings, 
    products, setAndSaveProducts,
    truckInventories, setAndSaveTruckInventories, 
    toast
) => {
    const addCashOpening = async (openingData) => {
        if (!user) {
            toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
            return { error: { message: "User not authenticated" }};
        }

        const existingOpen = cashOpenings.find(co => co.distributor_id === user.id && !co.closed_at);
        if (existingOpen) {
            toast({ title: "Error", description: "Ya existe una caja abierta para este distribuidor.", variant: "destructive" });
            return { error: { message: "Cashbox already open" }};
        }

        const newOpening = {
            id: uuidv4(),
            ...openingData,
            distributor_id: user.id,
            opening_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
        };

        const { data: result, error } = await setAndSaveCashOpenings(prev => [...prev, newOpening]);
        if (error) {
            toast({ title: "Error", description: `No se pudo abrir la caja. ${error.message}`, variant: "destructive" });
            return { error };
        }
        const savedOpening = result ? result.find(co => co.id === newOpening.id) : newOpening;
        
        // Update truck inventory based on this opening, if applicable.
        // This assumes `openingData.inventory` is an array of { productId, quantity }
        // And `openingData.truck_id` is set.
        if (savedOpening.truck_id && Array.isArray(savedOpening.inventory)) {
            const inventoryUpdates = savedOpening.inventory.map(item => ({
                truck_id: savedOpening.truck_id,
                product_id: item.productId,
                quantity: item.quantity,
                last_updated: new Date().toISOString()
            }));
            
            // This needs to be an upsert on (truck_id, product_id) or careful management
            // For now, replacing entire inventory for the truck, which might not be ideal if multiple users share truck data.
            // Given schema, truck_inventories is a separate table.
            // We'd upsert into truck_inventories.
            
            // Simplified: just save this opening's inventory as the current truck inventory snapshot for the distributor.
            // More robust: setAndSaveTruckInventories would need to handle merging or replacing based on truck_id.
            await setAndSaveTruckInventories(prev => ({
                ...prev,
                [savedOpening.distributor_id]: savedOpening.inventory // Or use truck_id if that's the key
            }));
        }


        toast({ title: "Caja Abierta", description: `Caja abierta con ${savedOpening.initial_cash}.` });
        return { data: savedOpening, error: null };
    };

    const getCurrentCashOpening = (distributorId) => {
        return cashOpenings.find(co => co.distributor_id === distributorId && !co.closed_at); // Assuming a 'closed_at' field
    };
    
    const getAllCashOpenings = () => cashOpenings;

    return {
        addCashOpening,
        getCurrentCashOpening,
        getAllCashOpenings
    };
};
