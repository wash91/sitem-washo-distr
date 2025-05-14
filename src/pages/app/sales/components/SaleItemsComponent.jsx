
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import SaleItemRow from '@/pages/app/sales/components/SaleItemRow';

const SaleItemsComponent = React.memo(({ items, allProducts, truckInventory, onItemChange, onAddItem, onRemoveItem, orderToProcess, onReturnedContainerChange }) => (
    <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-700 mb-1 block">Productos de la Venta</Label>
        <div className="space-y-2 mt-1 max-h-60 overflow-y-auto custom-scrollbar p-1 border rounded-md bg-gray-50">
            {items.length > 0 ? items.map((item, index) => (
                <SaleItemRow 
                    key={index}
                    item={item} 
                    index={index}
                    allProducts={allProducts}
                    truckInventory={truckInventory}
                    onItemChange={onItemChange}
                    onRemoveItem={onRemoveItem}
                    orderToProcess={orderToProcess}
                    onReturnedContainerChange={onReturnedContainerChange}
                />
            )) : <p className="text-sm text-gray-500 text-center py-4">No hay productos agregados.</p>}
        </div>
        {!orderToProcess && 
            <Button type="button" variant="outline" onClick={onAddItem} className="mt-2 w-full border-teal-500 text-teal-600 hover:bg-teal-50">
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
            </Button>
        }
    </div>
));

export default SaleItemsComponent;
