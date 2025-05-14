
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const SaleFromOrderModal = ({ isOpen, onClose, order, onSubmitSale, allProducts }) => {
    const { toast } = useToast();
    const [saleDetails, setSaleDetails] = useState({
        paymentMethod: 'efectivo',
        observations: '',
        items: []
    });

    useEffect(() => {
        if (order) {
            setSaleDetails({
                paymentMethod: order.paymentMethod || 'efectivo',
                observations: order.observations || '',
                items: order.items.map(item => ({
                    ...item,
                    price: parseFloat(item.price),
                    originalQuantity: item.quantity, 
                    productName: allProducts.find(p => p.id === item.productId)?.name || item.productName
                })),
            });
        }
    }, [order, allProducts]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...saleDetails.items];
        if (field === 'quantity') {
            newItems[index][field] = Math.max(0, parseInt(value, 10) || 0);
        } else if (field === 'price') {
            newItems[index][field] = parseFloat(value) || 0;
        } else {
            newItems[index][field] = value;
        }
        setSaleDetails(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = () => {
        onSubmitSale(saleDetails);
    };

    const totalSaleAmount = useMemo(() => {
        return saleDetails.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    }, [saleDetails.items]);

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Registrar Venta para Pedido: ...{order.id.slice(-6)}</DialogTitle>
                    <DialogDescription>Confirme o ajuste los detalles de la entrega y venta para {order.customerName}.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto p-1">
                    <div className="space-y-2">
                        <Label>Productos Entregados:</Label>
                        {saleDetails.items.map((item, index) => (
                            <div key={item.productId} className="grid grid-cols-10 gap-2 items-center p-2 border rounded-md">
                                <span className="col-span-4 text-sm truncate" title={item.productName}>{item.productName}</span>
                                <div className="col-span-2">
                                    <Label htmlFor={`qty-${index}`} className="text-xs">Cant.</Label>
                                    <Input
                                        id={`qty-${index}`}
                                        type="number"
                                        value={item.quantity}
                                        max={item.originalQuantity}
                                        min="0"
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        className="text-sm h-8 w-full"
                                    />
                                </div>
                                <div className="col-span-2">
                                     <Label htmlFor={`price-${index}`} className="text-xs">Precio</Label>
                                    <Input
                                        id={`price-${index}`}
                                        type="number"
                                        value={item.price.toFixed(2)}
                                        step="0.01"
                                        min="0"
                                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                        className="text-sm h-8 w-full"
                                    />
                                </div>
                                <div className="col-span-2 text-right">
                                    <Label className="text-xs">Subtotal</Label>
                                    <p className="text-sm font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <Label htmlFor="paymentMethodSale">Forma de Pago</Label>
                        <Select name="paymentMethodSale" value={saleDetails.paymentMethod} onValueChange={(value) => setSaleDetails(prev => ({ ...prev, paymentMethod: value }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="efectivo">Efectivo</SelectItem>
                                <SelectItem value="credito">Crédito</SelectItem>
                                <SelectItem value="transferencia">Transferencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="observationsSale">Observaciones de la Venta</Label>
                        <textarea id="observationsSale" name="observationsSale" value={saleDetails.observations} onChange={(e) => setSaleDetails(prev => ({ ...prev, observations: e.target.value }))} className="w-full p-2 border rounded-md text-sm" rows="2"></textarea>
                    </div>
                    <div className="text-right font-bold text-lg">
                        Total Venta: ${totalSaleAmount.toFixed(2)}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleSubmit}>Confirmar y Registrar Venta</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SaleFromOrderModal;
