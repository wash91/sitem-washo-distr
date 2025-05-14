
import { v4 as uuidv4 } from 'uuid';

export const expenseHandler = (user, expenses, setAndSaveExpenses, toast, deleteExpenseSupabase) => {
    const addExpense = async (expenseData) => {
         if (!user) {
            toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
            return { error: { message: "User not authenticated" }};
        }
        const newExpense = {
            id: uuidv4(),
            ...expenseData,
            distributor_id: user.id,
            expense_date: expenseData.expense_date || new Date().toISOString(),
            created_at: new Date().toISOString(),
        };
        const { data: result, error } = await setAndSaveExpenses(prev => [...prev, newExpense]);
        if (error) {
            toast({ title: "Error", description: `No se pudo agregar el gasto. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Gasto Agregado", description: `Gasto de ${newExpense.amount} por ${newExpense.category_name} agregado.` });
        }
        return { data: result ? result.find(e => e.id === newExpense.id) : newExpense, error };
    };

    const deleteExpense = async (expenseId) => {
        const { error } = await deleteExpenseSupabase(expenseId);
        if (error) {
            toast({ title: "Error", description: `No se pudo eliminar el gasto. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Gasto Eliminado", description: "El gasto ha sido eliminado.", variant: "destructive" });
        }
        return { error };
    };
    
    const getExpensesByDistributor = (distributorId) => {
        return expenses.filter(e => e.distributor_id === distributorId);
    };

    return {
        addExpense,
        deleteExpense,
        getExpensesByDistributor,
        getAllExpenses: () => expenses
    };
};
