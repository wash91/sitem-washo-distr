
import { v4 as uuidv4 } from 'uuid';

export const productHandler = (products, setAndSaveProducts, toast, deleteProductSupabase) => {
    const addProduct = async (productData) => {
        const newProduct = { 
            id: uuidv4(), 
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data: result, error } = await setAndSaveProducts(prev => [...prev, newProduct]);
        if (error) {
            toast({ title: "Error", description: "No se pudo agregar el producto. " + error.message, variant: "destructive" });
        } else {
            toast({ title: "Producto Agregado", description: `${newProduct.name} ha sido agregado.` });
        }
        return { data: result ? result.find(p => p.id === newProduct.id) : newProduct, error };
    };

    const updateProduct = async (productId, updatedData) => {
         const productToUpdate = { 
            ...updatedData, 
            id: productId, 
            updated_at: new Date().toISOString() 
        };
        const { data: result, error } = await setAndSaveProducts(prev => 
            prev.map(p => p.id === productId ? { ...p, ...productToUpdate } : p)
        );
        if (error) {
            toast({ title: "Error", description: "No se pudo actualizar el producto. " + error.message, variant: "destructive" });
        } else {
            toast({ title: "Producto Actualizado", description: "Datos del producto actualizados." });
        }
        return { data: result ? result.find(p => p.id === productId) : productToUpdate, error };
    };

    const deleteProduct = async (productId) => {
        const { error } = await deleteProductSupabase(productId);
         if (error) {
            toast({ title: "Error", description: "No se pudo eliminar el producto. " + error.message, variant: "destructive" });
        } else {
            toast({ title: "Producto Eliminado", description: "El producto ha sido eliminado.", variant: "destructive" });
        }
        return { error };
    };

    const getProductById = (productId) => {
        return products.find(p => p.id === productId);
    };
    
    const getAllProducts = () => products;

    return {
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getAllProducts
    };
};
