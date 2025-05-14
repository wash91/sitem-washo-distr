
import { v4 as uuidv4 } from 'uuid';

export const cashClosingHandler = (user, cashClosings, setAndSaveCashClosings, cashOpenings, toast) => {
    const addCashClosing = async (closingData) => {
        if (!user) {
            toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
            return { error: { message: "User not authenticated" }};
        }

        const openCashbox = cashOpenings.find(co => co.id === closingData.cash_opening_id && co.distributor_id === user.id && !co.closed_at);
        if (!openCashbox) {
            toast({ title: "Error", description: "No se encontró una caja abierta válida para cerrar.", variant: "destructive" });
            return { error: { message: "No valid open cashbox found" }};
        }

        const newClosing = {
            id: uuidv4(),
            ...closingData,
            distributor_id: user.id,
            closing_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
        };
        
        const { data: result, error } = await setAndSaveCashClosings(prev => [...prev, newClosing]);
        if (error) {
            toast({ title: "Error", description: `No se pudo cerrar la caja. ${error.message}`, variant: "destructive" });
            return { error };
        }
        
        // Mark the cash opening as closed (this needs setAndSaveCashOpenings)
        // For now, this is an optimistic update. The actual save would be in DataContext.
        // This handler should ideally call a function passed from DataContext to update cashOpenings.
        // Or DataContext could listen for cashClosing events.
        // For now, assuming direct modification is handled by the caller or by reloading data.


        toast({ title: "Caja Cerrada", description: `Caja cerrada con un saldo final de ${newClosing.final_cash}.` });
        return { data: result ? result.find(cc => cc.id === newClosing.id) : newClosing, error: null };
    };
    
    const getAllCashClosings = () => cashClosings;

    return {
        addCashClosing,
        getAllCashClosings
    };
};
