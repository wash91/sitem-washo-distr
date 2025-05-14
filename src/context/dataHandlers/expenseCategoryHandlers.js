
import { v4 as uuidv4 } from 'uuid';

export const expenseCategoryHandler = (categories, setAndSaveCategories, toast, deleteCategorySupabase) => {
    const addExpenseCategory = async (categoryName) => {
        if (!categoryName || categoryName.trim() === "") {
            toast({ title: "Error", description: "El nombre de la categoría no puede estar vacío.", variant: "destructive" });
            return { error: { message: "El nombre de la categoría no puede estar vacío." } };
        }
        const existingCategory = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (existingCategory) {
            toast({ title: "Categoría Existente", description: `La categoría "${categoryName}" ya existe.`, variant: "info" });
            return { data: existingCategory, error: null };
        }
        const newCategory = { 
            id: uuidv4(),
            name: categoryName.trim(),
            created_at: new Date().toISOString()
        };
        const { data: result, error } = await setAndSaveCategories(prev => [...prev, newCategory]);

        if (error) {
            toast({ title: "Error", description: `No se pudo agregar la categoría. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Categoría Agregada", description: `Categoría "${newCategory.name}" agregada.` });
        }
        return { data: result ? result.find(c => c.id === newCategory.id) : newCategory, error };
    };

    const deleteExpenseCategory = async (categoryName) => {
        const categoryToDelete = categories.find(cat => cat.name === categoryName);
        if (!categoryToDelete) {
            toast({ title: "Error", description: `Categoría "${categoryName}" no encontrada.`, variant: "destructive" });
            return { error: { message: "Category not found" }};
        }

        const { error } = await deleteCategorySupabase(categoryToDelete.name); // PK is name if using that for delete
        if (error) {
            toast({ title: "Error", description: `No se pudo eliminar la categoría. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Categoría Eliminada", description: `Categoría "${categoryName}" eliminada.` });
        }
        return { error };
    };

    const getAllExpenseCategories = () => categories;

    return {
        addExpenseCategory,
        deleteExpenseCategory,
        getAllExpenseCategories
    };
};
