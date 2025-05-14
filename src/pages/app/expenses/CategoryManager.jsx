
import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

const CategoryManager = ({ categories, onAdd, onUpdate, onDelete }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null); 

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            onAdd(newCategoryName.trim());
            setNewCategoryName('');
        }
    };
    
    const handleUpdateCategory = () => {
        if (editingCategory && editingCategory.newName.trim()) {
            onUpdate(editingCategory.oldName, editingCategory.newName.trim());
            setEditingCategory(null);
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Gestionar Categorías de Gasto</DialogTitle>
                <DialogDescription>Agregue, edite o elimine categorías.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Nueva categoría" 
                        value={newCategoryName} 
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button onClick={handleAddCategory}><PlusCircle className="h-4 w-4 mr-1"/> Agregar</Button>
                </div>
                {editingCategory && (
                    <div className="flex gap-2 p-2 border rounded-md">
                        <Input 
                            value={editingCategory.newName} 
                            onChange={(e) => setEditingCategory(prev => ({...prev, newName: e.target.value}))}
                        />
                        <Button onClick={handleUpdateCategory} variant="outline">Guardar</Button>
                        <Button onClick={() => setEditingCategory(null)} variant="ghost">Cancelar</Button>
                    </div>
                )}
                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar p-1">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center p-2 border rounded-md bg-slate-50">
                            <span className="capitalize text-sm text-gray-700">{cat.name}</span>
                            <div className="space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => setEditingCategory({ oldName: cat.name, newName: cat.name })}>
                                    <Edit className="h-4 w-4 text-yellow-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(cat.name)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <DialogFooter>
                <DialogTrigger asChild><Button variant="outline">Cerrar</Button></DialogTrigger>
            </DialogFooter>
        </>
    );
};

export default CategoryManager;
