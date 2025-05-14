
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const SaleItemRow = React.memo(({ item, index, allProducts, truckInventory, onItemChange, onRemoveItem, orderToProcess, onReturnedContainerChange }) => {
    const selectedProductDetails = allProducts.find(p => p.id === item.productId);
    const stockInTruck = truckInventory.find(pInv => pInv.productId === item.productId)?.quantity || 0;

    return (
        <div className="p-3 border rounded-lg bg-slate-50 shadow-sm mb-3 space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex-grow w-full sm:w-auto">
                    <Label htmlFor={`product-${index}`} className="text-xs">Producto</Label>
                    <Select 
                        id={`product-${index}`}
                        value={item.productId} 
                        onValueChange={(value) => onItemChange(index, 'productId', value)} 
                        disabled={!!orderToProcess}
                    >
                        <SelectTrigger className="bg-white text-sm"><SelectValue placeholder="Seleccionar Producto" /></SelectTrigger>
                        <SelectContent>
                            {allProducts.filter(p => p.category === 'Agua' || p.category === 'Accesorio' || p.category === 'Otro' || p.category === 'Recarga' || p.category === 'EquipoLleno' || p.category === 'Paca').map(productItem => (
                                <SelectItem 
                                    key={productItem.id} 
                                    value={productItem.id} 
                                    disabled={truckInventory.find(pInv => pInv.productId === productItem.id)?.quantity < 1 && item.productId !== productItem.id}
                                    className="text-sm"
                                >
                                    {productItem.name} (Stock: {truckInventory.find(pInv => pInv.productId === productItem.id)?.quantity || 0})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-20">
                    <Label htmlFor={`quantity-${index}`} className="text-xs">Cant.</Label>
                    <Input id={`quantity-${index}`} type="number" value={item.quantity} onChange={(e) => onItemChange(index, 'quantity', e.target.value)} min="1" className="bg-white text-sm text-center" disabled={!!orderToProcess} />
                </div>
                <div className="w-full sm:w-24">
                    <Label htmlFor={`price-${index}`} className="text-xs">Precio U.</Label>
                    <Input id={`price-${index}`} type="number" value={item.price.toFixed(2)} onChange={(e) => onItemChange(index, 'price', e.target.value)} step="0.01" className="bg-white text-sm text-right" disabled={!!orderToProcess} />
                </div>
                <div className="w-full sm:w-auto self-end sm:self-center">
                    <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)} disabled={!!orderToProcess && item.length <=1} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            {selectedProductDetails?.isReturnableContainer && (
                <div className="pl-1">
                    <Label htmlFor={`returnedContainerType-${index}`} className="text-xs">Envase devuelto por cliente</Label>
                    <Select 
                        id={`returnedContainerType-${index}`}
                        value={item.returnedContainerType || selectedProductDetails.returnsContainerType} 
                        onValueChange={(value) => onReturnedContainerChange(index, value)}
                        disabled={!!orderToProcess}
                        className="text-sm"
                    >
                        <SelectTrigger className="bg-white text-sm"><SelectValue placeholder="Seleccione envase devuelto" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="equipo_con_llave_vacio" className="text-sm">Bidón Vacío con Llave</SelectItem>
                            <SelectItem value="equipo_sin_llave_vacio" className="text-sm">Bidón Vacío sin Llave</SelectItem>
                            <SelectItem value="Ninguno" className="text-sm">Ninguno (Cobrar envase)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
});

export default SaleItemRow;
