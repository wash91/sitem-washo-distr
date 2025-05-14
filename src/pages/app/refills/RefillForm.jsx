
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Trash2, Camera, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';

const RefillFormItem = ({ item, index, products, onItemChange, onRemoveItem }) => {
    const selectedProduct = products.find(p => p.id === item.productId);
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 border rounded-lg bg-slate-50 shadow-sm mb-2">
            <Select 
                value={item.productId} 
                onValueChange={(value) => onItemChange(index, 'productId', value)}
            >
                <SelectTrigger className="flex-grow bg-white"><SelectValue placeholder="Seleccionar Producto" /></SelectTrigger>
                <SelectContent>
                    {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                            {p.name} (Costo: ${p.purchasePrice?.toFixed(2) || 'N/A'})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input 
                type="number" 
                value={item.quantity} 
                onChange={(e) => onItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)} 
                min="1"
                className="w-full sm:w-24 bg-white text-center"
                placeholder="Cant."
            />
            <span className="w-full sm:w-32 text-sm font-semibold text-gray-700 text-right pr-2">
                Subtotal: ${((item.quantity || 0) * (selectedProduct?.purchasePrice || 0)).toFixed(2)}
            </span>
            <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-5 w-5" />
            </Button>
        </div>
    );
};

const RefillForm = ({ initialData, products, user, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialData);
  const [receiptPreview, setReceiptPreview] = useState(initialData.receiptImage || null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    setFormData(initialData);
    setReceiptPreview(initialData.receiptImage || null);
  }, [initialData]);

  useEffect(() => {
    const total = formData.items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + ((item.quantity || 0) * (product?.purchasePrice || 0));
    }, 0);
    setFormData(prev => ({ ...prev, totalCost: total }));
  }, [formData.items, products]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        newItems[index].productName = product ? product.name : '';
    }
    if (field === 'quantity' && value < 1) newItems[index].quantity = 1;
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
        ...prev,
        items: [...prev.items, { productId: '', quantity: 1, productName: '' }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReceiptImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({ variant: "destructive", title: "Archivo muy grande", description: "La imagen del recibo no debe exceder los 2MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receiptImage: reader.result }));
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeReceiptImage = () => {
    setFormData(prev => ({ ...prev, receiptImage: null }));
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (formData.items.some(item => !item.productId || item.quantity < 1)) {
        toast({ variant: "destructive", title: "Error de Validación", description: "Todos los productos deben ser seleccionados y tener una cantidad válida (mínimo 1)."});
        return;
    }
    if (formData.items.length === 0) {
        toast({ variant: "destructive", title: "Error de Validación", description: "Debe agregar al menos un producto a la recarga."});
        return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">Fecha</Label>
                <Input id="date" type="text" value={format(new Date(), 'dd/MM/yyyy HH:mm')} disabled className="mt-1 bg-gray-100"/>
            </div>
            <div>
                <Label htmlFor="distributor" className="text-sm font-medium text-gray-700">Registrado por</Label>
                <Input id="distributor" type="text" value={user?.name || 'N/A'} disabled className="mt-1 bg-gray-100"/>
            </div>
        </div>
        
        <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">Productos de la Recarga</Label>
            <div className="space-y-2 mt-1 max-h-60 overflow-y-auto custom-scrollbar p-1 border rounded-md">
                {formData.items.length > 0 ? formData.items.map((item, index) => (
                    <RefillFormItem 
                        key={index}
                        item={item} 
                        index={index}
                        products={products}
                        onItemChange={handleItemChange}
                        onRemoveItem={removeItem}
                    />
                )) : <p className="text-sm text-gray-500 text-center py-4">No hay productos agregados.</p>}
            </div>
            <Button type="button" variant="outline" onClick={addItem} className="mt-3 w-full border-teal-500 text-teal-600 hover:bg-teal-50">
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
            </Button>
        </div>

        <div className="mt-4 p-3 bg-sky-50 rounded-lg text-right">
            <span className="text-lg font-bold text-sky-700">
                Costo Total Recarga: ${formData.totalCost.toFixed(2)}
            </span>
        </div>
        
        <div>
            <Label htmlFor="observations" className="text-sm font-medium text-gray-700">Observaciones</Label>
            <Textarea 
                id="observations" 
                name="observations" 
                value={formData.observations} 
                onChange={handleInputChange} 
                className="mt-1 w-full p-2 border rounded-md focus:ring-sky-500 focus:border-sky-500" 
                rows="3" 
                placeholder="Detalles de la compra, proveedor, número de factura, etc."
            />
        </div>

        <div>
            <Label className="text-sm font-medium text-gray-700">Foto del Recibo (Opcional)</Label>
            <div className="mt-1 flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="border-indigo-500 text-indigo-600 hover:bg-indigo-50">
                    <Camera className="mr-2 h-4 w-4" /> {receiptPreview ? 'Cambiar Foto' : 'Subir Foto'}
                </Button>
                <Input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleReceiptImageChange} 
                    className="hidden" 
                    accept="image/*" 
                />
                {receiptPreview && (
                    <div className="relative group">
                        <img  src={receiptPreview} alt="Vista previa del recibo" className="h-20 w-20 object-cover rounded-md border shadow-sm" src="https://images.unsplash.com/photo-1698463110187-690dc51722cb" />
                        <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon"
                            onClick={removeReceiptImage}
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Tamaño máximo: 2MB. Formatos: JPG, PNG, GIF.</p>
        </div>

        <DialogFooter className="pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700">Guardar Recarga</Button>
        </DialogFooter>
    </form>
  );
};

export default RefillForm;
