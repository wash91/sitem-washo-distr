
import { v4 as uuidv4 } from 'uuid';

export const refillHandler = (
    user,
    products, setAndSaveProducts,
    refills, setAndSaveRefills,
    expenses, setAndSaveExpenses,
    expenseCategories, setAndSaveExpenseCategories,
    toast,
    deleteRefillSupabase
) => {
    const addRefill = async (refillData) => {
        if (!user) {
            toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
            return { error: { message: "User not authenticated" }};
        }
        
        const newRefill = {
            id: uuidv4(),
            ...refillData,
            distributor_id: user.id,
            refill_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
        };

        const { data: refillResult, error: refillError } = await setAndSaveRefills(prev => [...prev, newRefill]);
        if (refillError) {
            toast({ title: "Error de Recarga", description: `No se pudo registrar la recarga. ${refillError.message}`, variant: "destructive" });
            return { error: refillError };
        }
        const savedRefill = refillResult ? refillResult.find(r => r.id === newRefill.id) : newRefill;

        savedRefill.items.forEach(async item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const updatedStock = (product.stock || 0) + item.quantity;
                await setAndSaveProducts(prevProds => prevProds.map(p => p.id === item.productId ? {...p, stock: updatedStock, updated_at: new Date().toISOString() } : p));
            }
        });

        if (savedRefill.total_cost > 0) {
            let otherCategory = expenseCategories.find(cat => cat.name.toLowerCase() === 'recarga de inventario');
            if (!otherCategory) {
                const {data: catData, error: catError} = await setAndSaveExpenseCategories(prev => {
                    const existing = prev.find(c => c.name.toLowerCase() === 'recarga de inventario');
                    if (existing) return prev;
                    const newCat = {id: uuidv4(), name: 'Recarga de Inventario', created_at: new Date().toISOString() };
                    return [...prev, newCat];
                });
                if(catError) console.error("Failed to ensure 'Recarga de Inventario' category exists", catError);
                if(catData) otherCategory = catData.find(c => c.name.toLowerCase() === 'recarga de inventario');
            }

            const newExpense = {
                id: uuidv4(),
                expense_date: new Date().toISOString(),
                distributor_id: user.id,
                category_id: otherCategory?.id || null,
                category_name: otherCategory?.name || 'Recarga de Inventario',
                amount: savedRefill.total_cost,
                description: `Costo de recarga de inventario (Refill ID: ${savedRefill.id})`,
                created_at: new Date().toISOString(),
            };
           await setAndSaveExpenses(prev => [...prev, newExpense]);
        }

        toast({ title: "Recarga Registrada", description: `Recarga de inventario por ${savedRefill.total_cost} registrada.` });
        return { data: savedRefill, error: null };
    };
    
    const deleteRefill = async (refillId) => {
        const { error } = await deleteRefillSupabase(refillId);
        if (error) {
            toast({ title: "Error", description: `No se pudo eliminar la recarga. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Recarga Eliminada", description: "La recarga ha sido eliminada.", variant: "destructive" });
            // Stock adjustments would be complex here, best handled by not allowing deletes or using compensating transactions
        }
        return { error };
    };

    return {
        addRefill,
        deleteRefill,
        getAllRefills: () => refills,
    };
};
