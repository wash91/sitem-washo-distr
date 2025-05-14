

export const truckInventoryHandler = (cashOpenings, truckInventories, products) => {
    
    const getTruckInventoryForDistributor = (distributorId) => {
        const openCashbox = cashOpenings.find(co => co.distributor_id === distributorId && !co.closed_at);
        if (openCashbox && openCashbox.inventory) {
            // This assumes cashOpenings.inventory is the source of truth for active distributors
            // And it's an array of { productId, quantity, name, price }
            return openCashbox.inventory;
        }
        
        // Fallback or direct query to truck_inventories if cashOpening not found or not structured that way.
        // The current truckInventories state structure might be an object like:
        // { truckId1: [{productId, quantity}, ...], truckId2: [...] }
        // Or flat list: [{truck_id, product_id, quantity}, ...]
        // For simplicity, assuming the cashOpenings is the primary source for active distributors.
        // If using `truck_inventories` table directly for a truck not tied to current opening:
        // const specificTruckInventory = truckInventories[someTruckId]; // if keyed by truckId
        // return specificTruckInventory ? specificTruckInventory.map(item => ({...item, ...products.find(p => p.id === item.productId)})) : [];
        return [];
    };

    const getInventoryForTruck = (truckId) => {
        // This would query the truck_inventories table/state for a specific truck_id
        // And map product details.
        // Example: if truckInventories is [{truck_id, product_id, quantity}, ...]
        // return truckInventories.filter(item => item.truck_id === truckId)
        //                      .map(item => ({ ...item, ...products.find(p => p.id === item.product_id)}));
        // For now, this is complex due to current state structure and will be simplified.
        // The DistributorDashboardPage uses getTruckInventoryForDistributor which relies on cashOpenings.
        
        // A more direct approach if `truckInventories` is an object keyed by `truck_id`
        // and values are arrays of `{product_id, quantity}`
        const inventoryItems = truckInventories[truckId];
        if (inventoryItems && Array.isArray(inventoryItems)) {
            return inventoryItems.map(item => {
                const productDetails = products.find(p => p.id === item.product_id);
                return {
                    ...item,
                    name: productDetails?.name || 'Producto Desconocido',
                    category: productDetails?.category || 'N/A',
                };
            });
        }
        return [];
    };


    return {
        getTruckInventoryForDistributor,
        getInventoryForTruck,
        getAllTruckInventories: () => truckInventories // This is raw state, might need processing
    };
};
