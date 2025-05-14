
import { v4 as uuidv4 } from 'uuid';

export const cashClosingHandler = (user, cashClosings, setAndSaveCashClosings, cashOpenings, toast) => {
    const addCashClosing = async (closingData) => {
        if (!user) {
            toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
            return { error: { message: "User not authenticated" }};
        }
        
        const actualDistributorId = closingData.distributorId || user.id;

        const openCashbox = cashOpenings.find(co => co.id === closingData.openingId && co.distributorId === actualDistributorId && !co.isClosed);
        if (!openCashbox) {
            toast({ title: "Error", description: "No se encontró una apertura de caja activa y válida para el distribuidor seleccionado.", variant: "destructive" });
            return { error: { message: "No valid open cashbox found for the selected distributor" }};
        }

        const newClosing = {
            id: uuidv4(),
            ...closingData,
            distributorId: actualDistributorId, 
            created_at: new Date().toISOString(),
        };
        
        const { data: result, error } = await setAndSaveCashClosings(prev => [...prev, newClosing]);
        if (error) {
            toast({ title: "Error", description: `No se pudo cerrar la caja. ${error.message}`, variant: "destructive" });
            return { error };
        }
        
        toast({ title: "Caja Cerrada", description: `Caja cerrada para ${newClosing.distributorName}.` });
        return { data: result ? result.find(cc => cc.id === newClosing.id) : newClosing, error: null };
    };
    
    const getAllCashClosings = () => cashClosings;

    return {
        addCashClosing,
        getAllCashClosings
    };
};
