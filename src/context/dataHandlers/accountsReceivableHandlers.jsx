
import { v4 as uuidv4 } from 'uuid';

export const accountsReceivableHandler = (receivables, setAndSaveReceivables, toast) => {
    
    const addPaymentToReceivable = async (receivableId, paymentAmount) => {
        const receivable = receivables.find(r => r.id === receivableId);
        if (!receivable) {
            toast({ title: "Error", description: "Cuenta por cobrar no encontrada.", variant: "destructive" });
            return { error: { message: "Receivable not found." }};
        }

        const newAmountPaid = (receivable.amount_paid || 0) + paymentAmount;
        const newStatus = newAmountPaid >= receivable.amount_due ? 'pagado' : 'parcial';

        const updatedReceivable = {
            ...receivable,
            amount_paid: newAmountPaid,
            status: newStatus,
            updated_at: new Date().toISOString(),
        };
        
        const { data: result, error } = await setAndSaveReceivables(prev => 
            prev.map(r => r.id === receivableId ? updatedReceivable : r)
        );

        if (error) {
            toast({ title: "Error", description: `No se pudo registrar el pago. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Pago Registrado", description: `Pago de ${paymentAmount} registrado para la cuenta.` });
            // TODO: Update customer debt if `customers` state is managed here or via a callback
        }
        return { data: result ? result.find(r => r.id === receivableId) : updatedReceivable, error };
    };

    const getAllReceivables = () => receivables;
    
    const getReceivablesByCustomer = (customerId) => {
        return receivables.filter(r => r.customer_id === customerId && r.status !== 'pagado');
    };

    return {
        addPaymentToReceivable,
        getAllReceivables,
        getReceivablesByCustomer
    };
};
