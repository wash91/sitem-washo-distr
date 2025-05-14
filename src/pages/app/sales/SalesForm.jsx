
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle, Trash2, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import CustomerSearchComponent from '@/pages/app/sales/components/CustomerSearchComponent';
import SaleItemsComponent from '@/pages/app/sales/components/SaleItemsComponent';
import PaymentDetailsComponent from '@/pages/app/sales/components/PaymentDetailsComponent';

const SaleForm = ({ onSubmit, onCancel, initialSaleData, customers, allProducts, truckInventory, navigate, orderToProcess = null }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const defaultSaleState = useMemo(() => ({
        customerId: '', customerName: '', customerAddress: '',
        items: [{ productId: '', quantity: 1, price: 0, productName: '', returnedContainerType: '' }],
        paymentMethod: 'efectivo', amountPaid: 0, amountCredit: 0, observations: '', totalAmount: 0,
        distributorId: user?.id, distributorName: user?.name,
    }), [user]);
    
    const [newSale, setNewSale] = useState(initialSaleData || defaultSaleState);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');

    useEffect(() => {
        if (orderToProcess) {
            const customer = customers.find(c => c.id === orderToProcess.customerId);
            setNewSale({
                ...defaultSaleState,
                customerId: orderToProcess.customerId, customerName: orderToProcess.customerName,
                customerAddress: customer?.address || orderToProcess.customerAddress,
                items: orderToProcess.items.map(item => {
                    const productDetails = allProducts.find(p => p.id === item.productId);
                    return {
                        productId: item.productId, quantity: item.quantity, price: item.price,
                        productName: item.productName,
                        returnedContainerType: productDetails?.isReturnableContainer ? (item.returnedContainerType || productDetails.returnsContainerType) : ''
                    };
                }),
                paymentMethod: orderToProcess.paymentMethod || 'efectivo',
                observations: orderToProcess.observations || '',
                totalAmount: orderToProcess.totalAmount, amountPaid: orderToProcess.totalAmount, amountCredit: 0,
                orderId: orderToProcess.id, 
                distributorId: orderToProcess.assignedDistributorId || user?.id,
                distributorName: orderToProcess.assignedDistributorName || user?.name
            });
            setCustomerSearchTerm(orderToProcess.customerName);
        } else if(initialSaleData) {
            setNewSale(initialSaleData);
            setCustomerSearchTerm(initialSaleData.customerName || '');
        } else {
            setNewSale(defaultSaleState);
            setCustomerSearchTerm('');
        }
    }, [initialSaleData, orderToProcess, customers, user, defaultSaleState, allProducts]);


    useEffect(() => {
        const total = newSale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const paid = parseFloat(newSale.amountPaid) || 0;
        const credit = total - paid > 0 ? total - paid : 0;
        setNewSale(prev => ({ ...prev, totalAmount: total, amountCredit: credit }));
    }, [newSale.items, newSale.amountPaid]);

    const handleCustomerSearchChange = useCallback((e) => {
        setCustomerSearchTerm(e.target.value);
        setNewSale(prev => ({ ...prev, customerId: '', customerName: e.target.value, customerAddress: '' })); 
    }, []);

    const selectCustomer = useCallback((customer) => {
        setCustomerSearchTerm(customer.name); 
        let customerPriceKey = customer.type === 'negocio' ? 'businessPrice' : 'consumerPrice';

        const updatedItems = newSale.items.map(item => {
            const productDetails = allProducts.find(p => p.id === item.productId);
            return { ...item, price: productDetails ? (productDetails[customerPriceKey] || productDetails.consumerPrice || 0) : 0 };
        });
        const newTotalAmount = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        setNewSale(prev => ({ 
            ...prev, customerId: customer.id, customerName: customer.name, customerAddress: customer.address,
            items: updatedItems, amountPaid: !orderToProcess ? newTotalAmount : prev.amountPaid, totalAmount: newTotalAmount
        }));
    }, [allProducts, newSale.items, orderToProcess]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name === "amountPaid") {
            const paid = parseFloat(value) || 0;
            setNewSale(prev => ({ ...prev, amountPaid: paid }));
        } else {
            setNewSale(prev => ({ ...prev, [name]: value }));
        }
    }, []);
    
    const handlePaymentMethodChange = useCallback((value) => {
        setNewSale(prev => ({ ...prev, paymentMethod: value }));
    }, []);

    const handleItemChange = useCallback((index, field, value) => {
        const updatedItems = [...newSale.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        if (field === 'productId') {
            const selectedProduct = allProducts.find(p => p.id === value);
            let priceToUse = selectedProduct?.consumerPrice || 0;
            const currentCustomer = customers.find(c => c.id === newSale.customerId);
            if (currentCustomer?.type === 'negocio' && selectedProduct?.businessPrice) {
                priceToUse = selectedProduct.businessPrice;
            }
            updatedItems[index].price = selectedProduct ? priceToUse : 0;
            updatedItems[index].productName = selectedProduct ? selectedProduct.name : '';
            updatedItems[index].returnedContainerType = selectedProduct?.isReturnableContainer ? selectedProduct.returnsContainerType : '';
        }
        if (field === 'quantity') updatedItems[index].quantity = Math.max(1, parseInt(value,10) || 1);
        if (field === 'price') updatedItems[index].price = parseFloat(value) || 0;
        
        setNewSale(prev => ({ ...prev, items: updatedItems }));
    }, [newSale.items, newSale.customerId, allProducts, customers]);

    const handleReturnedContainerChange = useCallback((index, value) => {
        const updatedItems = [...newSale.items];
        updatedItems[index].returnedContainerType = value;
        setNewSale(prev => ({ ...prev, items: updatedItems }));
    }, [newSale.items]);

    const addItem = useCallback(() => {
        setNewSale(prev => ({ ...prev, items: [...prev.items, { productId: '', quantity: 1, price: 0, productName: '', returnedContainerType: '' }] }));
    }, []);

    const removeItem = useCallback((index) => {
        setNewSale(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    }, []);

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        if (!newSale.customerId) {
            toast({ variant: "destructive", title: "Cliente no seleccionado", description: "Busque y seleccione un cliente o cree uno nuevo." }); return;
        }
        if (newSale.items.some(item => !item.productId || item.quantity < 1)) {
            toast({ variant: "destructive", title: "Error de Validación", description: "Al menos un producto con cantidad válida es requerido." }); return;
        }
        if (newSale.amountPaid > newSale.totalAmount) {
            toast({ variant: "destructive", title: "Error de Pago", description: "El monto pagado no puede ser mayor al total." }); return;
        }
    
        for (const item of newSale.items) {
            const productDetails = allProducts.find(p => p.id === item.productId);
            const productInInventory = truckInventory.find(pInv => pInv.productId === item.productId);
            if (!productInInventory || productInInventory.quantity < item.quantity) {
                toast({ variant: "destructive", title: "Error de inventario", description: `Stock insuficiente de ${item.productName || 'producto'}. Stock: ${productInInventory?.quantity || 0}` }); return;
            }
            if (productDetails?.isReturnableContainer && !item.returnedContainerType) {
                 toast({ variant: "destructive", title: "Envase no especificado", description: `Para "${productDetails.name}", especifique el envase devuelto o "Ninguno".` }); return;
            }
        }
        onSubmit(newSale, newSale.orderId);
    }, [newSale, allProducts, truckInventory, onSubmit, toast]);
    
    const handleNavigateToCreateCustomer = useCallback(() => {
        onCancel(); 
        navigate('/clientes', { state: { openAddModal: true, prefillCiRuc: customerSearchTerm.match(/^\d+$/) ? customerSearchTerm : '', prefillName: !customerSearchTerm.match(/^\d+$/) ? customerSearchTerm : '' } });
    }, [onCancel, navigate, customerSearchTerm]);

    return (
        <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
            <div>
                <Label htmlFor="date">Fecha de Venta</Label>
                <Input id="date" type="text" value={format(new Date(), 'dd/MM/yyyy HH:mm')} disabled className="bg-gray-100" />
            </div>
            <div>
                <Label htmlFor="distributor">Distribuidor</Label>
                <Input id="distributor" type="text" value={newSale.distributorName || user?.name || 'N/A'} disabled className="bg-gray-100" />
            </div>
            
            <CustomerSearchComponent 
                customerSearchTerm={customerSearchTerm}
                onSearchChange={handleCustomerSearchChange}
                onCustomerSelect={selectCustomer}
                onNavigateToCreate={handleNavigateToCreateCustomer}
                customers={customers}
                orderToProcess={orderToProcess}
                currentCustomerId={newSale.customerId}
            />
            {newSale.customerId && <p className="text-sm text-green-600">Cliente: {newSale.customerName} <br/> <span className="text-xs text-gray-500">{newSale.customerAddress}</span></p>}

            <SaleItemsComponent 
                items={newSale.items} allProducts={allProducts} truckInventory={truckInventory}
                onItemChange={handleItemChange} onAddItem={addItem} onRemoveItem={removeItem}
                orderToProcess={orderToProcess} onReturnedContainerChange={handleReturnedContainerChange}
            />

            <PaymentDetailsComponent 
                totalAmount={newSale.totalAmount} amountPaid={newSale.amountPaid} amountCredit={newSale.amountCredit}
                paymentMethod={newSale.paymentMethod} onInputChange={handleInputChange} onPaymentMethodChange={handlePaymentMethodChange}
            />
            
            <div>
                <Label htmlFor="observations">Observaciones</Label>
                <textarea id="observations" name="observations" value={newSale.observations} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" rows="2"></textarea>
            </div>
            <DialogFooter className="sticky bottom-0 bg-background py-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{orderToProcess ? 'Confirmar Venta de Pedido' : 'Guardar Venta'}</Button>
            </DialogFooter>
        </form>
    );
};
export default SaleForm;
