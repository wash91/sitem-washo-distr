
import { v4 as uuidv4 } from 'uuid';

export const managedOrderHandler = (user, orders, setAndSaveOrders, toast, distributors, deleteOrderSupabase) => {
    const addManagedOrder = async (orderData) => {
        const newOrder = {
            id: uuidv4(),
            ...orderData,
            status: orderData.status || 'Pendiente',
            order_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data: result, error } = await setAndSaveOrders(prev => [...prev, newOrder]);
        if (error) {
            toast({ title: "Error", description: `No se pudo crear el pedido. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Pedido Creado", description: `Pedido para ${newOrder.customer_name} creado.` });
        }
        return { data: result ? result.find(o => o.id === newOrder.id) : newOrder, error };
    };

    const updateManagedOrder = async (orderId, updatedData) => {
        const orderToUpdate = {
            ...updatedData,
            id: orderId,
            updated_at: new Date().toISOString(),
        };
        const { data: result, error } = await setAndSaveOrders(prev =>
            prev.map(o => o.id === orderId ? { ...o, ...orderToUpdate } : o)
        );
        if (error) {
            toast({ title: "Error", description: `No se pudo actualizar el pedido. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Pedido Actualizado", description: "Estado del pedido actualizado." });
        }
         return { data: result ? result.find(o => o.id === orderId) : orderToUpdate, error };
    };
    
    const deleteManagedOrder = async (orderId) => {
        const { error } = await deleteOrderSupabase(orderId);
         if (error) {
            toast({ title: "Error", description: `No se pudo eliminar el pedido. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Pedido Eliminado", description: "El pedido ha sido eliminado.", variant: "destructive" });
        }
        return { error };
    };

    const assignOrderToDistributor = async (orderId, distributorId) => {
        const distributor = distributors.find(d => d.id === distributorId);
        if (!distributor) {
            toast({ title: "Error", description: "Distribuidor no encontrado.", variant: "destructive" });
            return { error: { message: "Distributor not found" }};
        }
        return updateManagedOrder(orderId, { assigned_distributor_id: distributorId, status: 'Asignado' });
    };

    const getAssignedOrdersForDistributor = (distributorId) => {
        return orders.filter(order => order.assigned_distributor_id === distributorId && order.status !== 'Completado' && order.status !== 'Cancelado');
    };
    
    const getAllManagedOrders = () => orders;

    return {
        addManagedOrder,
        updateManagedOrder,
        deleteManagedOrder,
        assignOrderToDistributor,
        getAssignedOrdersForDistributor,
        getAllManagedOrders
    };
};
