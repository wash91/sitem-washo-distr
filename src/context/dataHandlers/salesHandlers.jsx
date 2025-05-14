
import { v4 as uuidv4 } from 'uuid';

export const salesHandler = (
    user, 
    sales, setAndSaveSales, 
    customers, setAndSaveCustomers,
    cashOpenings, 
    truckInventories, setAndSaveTruckInventories,
    managedOrders, setAndSaveManagedOrders,
    accountsReceivable, setAndSaveAccountsReceivable,
    toast,
    products, setAndSaveProducts,
    deleteSaleSupabase
) => {
    const addSale = async (saleData) => {
        if (!user) {
            toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
            return { error: { message: "User not authenticated" }};
        }

        const newSale = {
            id: uuidv4(),
            ...saleData,
            distributor_id: user.id,
            sale_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data: saleResult, error: saleError } = await setAndSaveSales(prev => [...prev, newSale]);
        if (saleError) {
            toast({ title: "Error de Venta", description: `No se pudo registrar la venta. ${saleError.message}`, variant: "destructive" });
            return { error: saleError };
        }
        const savedSale = saleResult ? saleResult.find(s => s.id === newSale.id) : newSale;


        const currentCashOpening = cashOpenings.find(co => co.distributor_id === user.id && !co.closed_at);
        let newInventory = currentCashOpening?.inventory ? JSON.parse(JSON.stringify(currentCashOpening.inventory)) : [];
        
        if (Array.isArray(newInventory)) {
            newSale.items.forEach(item => {
                const productIndex = newInventory.findIndex(p => p.productId === item.productId);
                if (productIndex !== -1) {
                    newInventory[productIndex].quantity -= item.quantity;
                }
            });
             await setAndSaveTruckInventories(prev => ({ ...prev, [user.id]: newInventory })); // Assuming truck inventory is per user ID for simplicity
        }


        if (newSale.customer_id) {
            const customer = customers.find(c => c.id === newSale.customer_id);
            if (customer) {
                const updatedCustomer = { ...customer, last_visit: new Date().toISOString() };
                if (newSale.payment_status === 'credito') {
                    updatedCustomer.debt = (customer.debt || 0) + newSale.total_amount;
                    const newReceivable = {
                        id: uuidv4(),
                        sale_id: newSale.id,
                        customer_id: newSale.customer_id,
                        amount_due: newSale.total_amount,
                        amount_paid: 0,
                        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days
                        status: 'pendiente',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };
                    await setAndSaveAccountsReceivable(prev => [...prev, newReceivable]);
                }
                await setAndSaveCustomers(prev => prev.map(c => c.id === newSale.customer_id ? updatedCustomer : c));
            }
        }
        
        if (newSale.related_order_id) {
           await setAndSaveManagedOrders(prev => prev.map(order => 
                order.id === newSale.related_order_id ? { ...order, status: 'Completado', updated_at: new Date().toISOString() } : order
            ));
        }

        newSale.items.forEach(async item => {
            const product = products.find(p => p.id === item.productId);
            if (product && product.isReturnableContainer && item.returnedQuantity > 0) {
                const emptyContainerProduct = products.find(p => p.id === product.returnsContainerType);
                if (emptyContainerProduct) {
                    const updatedStock = (emptyContainerProduct.stock || 0) + item.returnedQuantity;
                    await setAndSaveProducts(prevProds => prevProds.map(p => p.id === emptyContainerProduct.id ? {...p, stock: updatedStock, updated_at: new Date().toISOString() } : p));
                }
            }
             if (product) {
                const updatedStock = (product.stock || 0) - item.quantity;
                await setAndSaveProducts(prevProds => prevProds.map(p => p.id === product.id ? {...p, stock: updatedStock, updated_at: new Date().toISOString() } : p));
            }
        });


        toast({ title: "Venta Registrada", description: `Venta por ${newSale.total_amount} registrada.` });
        return { data: savedSale, error: null };
    };

    const getSalesByDistributor = (distributorId) => {
        return sales.filter(s => s.distributor_id === distributorId);
    };

    const getAllSales = () => sales;
    
    const deleteSale = async (saleId) => {
        const saleToDelete = sales.find(s => s.id === saleId);
        if (!saleToDelete) {
            toast({ title: "Error", description: "Venta no encontrada.", variant: "destructive" });
            return { error: { message: "Sale not found." } };
        }

        const { error } = await deleteSaleSupabase(saleId);
        if (error) {
            toast({ title: "Error", description: `No se pudo eliminar la venta. ${error.message}`, variant: "destructive" });
            return { error };
        }

        // Revert stock, customer debt, etc. (complex logic, simplified for now)
        // This is where Supabase functions/triggers would be very helpful for atomicity

        toast({ title: "Venta Eliminada", description: "La venta ha sido eliminada.", variant: "destructive" });
        return { error: null };
    };


    return {
        addSale,
        getSalesByDistributor,
        getAllSales,
        deleteSale
    };
};
