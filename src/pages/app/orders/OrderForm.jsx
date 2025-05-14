
import React, { useState, useMemo, useEffect } from 'react';
import { Search, UserPlus, PlusCircle, Trash2, MapPin, MessageSquare as WhatsAppIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { DialogFooter } from "@/components/ui/dialog";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";

const OrderForm = ({ onSubmit, onCancel, initialData, customers, allProducts, distributors, navigate }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const defaultState = {
        customerId: '',
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        customerGps: null,
        items: [{ productId: '', quantity: 1, price: 0, productName: '' }],
        paymentMethod: 'efectivo',
        observations: '',
        assignedDistributorId: '',
        assignedDistributorName: '',
        status: 'pending',
        totalAmount: 0,
    };

    const [orderData, setOrderData] = useState(initialData || defaultState);
    const [customerSearchTerm, setCustomerSearchTerm] = useState(initialData?.customerName || '');
    const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

    useEffect(() => {
        if (initialData) {
            setOrderData(initialData);
            setCustomerSearchTerm(initialData.customerName);
        } else {
            setOrderData(defaultState);
            setCustomerSearchTerm('');
        }
    }, [initialData]);

    useEffect(() => {
        const total = orderData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        setOrderData(prev => ({ ...prev, totalAmount: total }));
    }, [orderData.items]);

    const filteredCustomers = useMemo(() => {
        if (!customerSearchTerm) return [];
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
            customer.ciRuc?.toLowerCase().includes(customerSearchTerm.toLowerCase())
        ).slice(0, 5);
    }, [customers, customerSearchTerm]);

    const handleCustomerSearchChange = (e) => {
        setCustomerSearchTerm(e.target.value);
        setShowCustomerSuggestions(true);
        setOrderData(prev => ({ ...prev, customerId: '', customerName: e.target.value, customerAddress: '', customerPhone: '', customerGps: null }));
    };

    const selectCustomer = (customer) => {
        setCustomerSearchTerm(customer.name);
        setShowCustomerSuggestions(false);
        
        let customerPriceKey = 'consumerPrice';
        if (customer.type === 'negocio') {
            customerPriceKey = 'businessPrice';
        }

        setOrderData(prev => ({
            ...prev,
            customerId: customer.id,
            customerName: customer.name,
            customerAddress: customer.address,
            customerPhone: customer.phone,
            customerGps: customer.gps,
            items: prev.items.map(item => {
                const product = allProducts.find(p => p.id === item.productId);
                return {
                    ...item,
                    price: product ? (product[customerPriceKey] || product.consumerPrice || 0) : 0
                };
            })
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...orderData.items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        if (field === 'productId') {
            const selectedProduct = allProducts.find(p => p.id === value);
            let priceToUse = selectedProduct?.consumerPrice || 0;
            const currentCustomer = customers.find(c => c.id === orderData.customerId);
            if (currentCustomer?.type === 'negocio' && selectedProduct?.businessPrice) {
                priceToUse = selectedProduct.businessPrice;
            }
            updatedItems[index].price = selectedProduct ? priceToUse : 0;
            updatedItems[index].productName = selectedProduct ? selectedProduct.name : '';
        }
        if (field === 'quantity') updatedItems[index].quantity = Math.max(1, parseInt(value,10) || 1);
        if (field === 'price') updatedItems[index].price = parseFloat(value) || 0;
        
        setOrderData(prev => ({ ...prev, items: updatedItems }));
    };

    const addItem = () => {
        setOrderData(prev => ({
            ...prev,
            items: [...prev.items, { productId: '', quantity: 1, price: 0, productName: '' }]
        }));
    };

    const removeItem = (index) => {
        const updatedItems = orderData.items.filter((_, i) => i !== index);
        setOrderData(prev => ({ ...prev, items: updatedItems }));
    };

    const handleDistributorChange = (distributorId) => {
        const selectedDistributor = distributors.find(d => d.id === distributorId);
        setOrderData(prev => ({
            ...prev,
            assignedDistributorId: selectedDistributor?.id || '',
            assignedDistributorName: selectedDistributor?.name || ''
        }));
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (!orderData.customerId) {
            toast({ variant: "destructive", title: "Cliente no seleccionado", description: "Por favor, busque y seleccione un cliente." });
            return;
        }
        if (!orderData.assignedDistributorId) {
            toast({ variant: "destructive", title: "Distribuidor no asignado", description: "Por favor, asigne un distribuidor al pedido." });
            return;
        }
        if (orderData.items.some(item => !item.productId || item.quantity < 1)) {
            toast({ variant: "destructive", title: "Productos inválidos", description: "Asegúrese de que todos los productos tengan cantidad válida." });
            return;
        }
        onSubmit(orderData);
    };

    const openWhatsApp = () => {
        if (orderData.customerPhone) {
            const phoneNumber = orderData.customerPhone.replace(/\D/g, '');
            const message = `Hola ${orderData.customerName}, su pedido ha sido registrado. Total: $${orderData.totalAmount.toFixed(2)}. Gracias por preferir Bijao Water!`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            toast({ variant: "destructive", title: "Sin número", description: "El cliente no tiene un número de WhatsApp registrado." });
        }
    };

    const openMap = () => {
        if (orderData.customerGps && orderData.customerGps.lat && orderData.customerGps.lng) {
            window.open(`https://www.openstreetmap.org/?mlat=${orderData.customerGps.lat}&mlon=${orderData.customerGps.lng}#map=16/${orderData.customerGps.lat}/${orderData.customerGps.lng}`, '_blank');
        } else {
            toast({ variant: "destructive", title: "Sin GPS", description: "El cliente no tiene coordenadas GPS registradas." });
        }
    };

    return (
        <form onSubmit={handleSubmitForm} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="relative">
                <Label htmlFor="customerSearch">Buscar Cliente (Nombre o CI/RUC)</Label>
                <div className="flex items-center">
                    <Search className="absolute left-3 top-10 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        id="customerSearch"
                        type="text"
                        value={customerSearchTerm}
                        onChange={handleCustomerSearchChange}
                        onFocus={() => setShowCustomerSuggestions(true)}
                        placeholder="Escriba para buscar..."
                        className="pl-10"
                    />
                </div>
                {showCustomerSuggestions && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                                <div
                                    key={customer.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => selectCustomer(customer)}
                                >
                                    {customer.name} ({customer.ciRuc || 'N/A'})
                                </div>
                            ))
                        ) : (
                            customerSearchTerm && <p className="p-2 text-sm text-gray-500">No se encontraron clientes.</p>
                        )}
                        {customerSearchTerm && !orderData.customerId && (
                             <Button 
                                type="button" 
                                variant="outline" 
                                className="w-full mt-1 text-blue-600 border-blue-500 hover:bg-blue-50"
                                onClick={() => {
                                    onCancel(); 
                                    navigate('/clientes', { state: { openAddModal: true, prefillCiRuc: customerSearchTerm.match(/^\d+$/) ? customerSearchTerm : '', prefillName: !customerSearchTerm.match(/^\d+$/) ? customerSearchTerm : '' } });
                                }}
                            >
                                <UserPlus className="mr-2 h-4 w-4" /> Crear Nuevo Cliente: "{customerSearchTerm}"
                            </Button>
                        )}
                    </div>
                )}
            </div>
            {orderData.customerId && 
                <div className="text-sm p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-green-700">Cliente: {orderData.customerName}</p>
                            <p className="text-xs text-gray-600">Dirección: {orderData.customerAddress}</p>
                            <p className="text-xs text-gray-600">Teléfono: {orderData.customerPhone}</p>
                        </div>
                        <div className="flex space-x-1">
                            <Button type="button" variant="ghost" size="icon" onClick={openWhatsApp} title="Contactar por WhatsApp" disabled={!orderData.customerPhone}>
                                <WhatsAppIcon className={`h-5 w-5 ${orderData.customerPhone ? 'text-green-500' : 'text-gray-400'}`} />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={openMap} title="Ver en Mapa" disabled={!orderData.customerGps?.lat}>
                                <MapPin className={`h-5 w-5 ${orderData.customerGps?.lat ? 'text-blue-500' : 'text-gray-400'}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            }

            <div className="space-y-2">
                <Label>Productos del Pedido</Label>
                {orderData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                        <Select value={item.productId} onValueChange={(value) => handleItemChange(index, 'productId', value)} className="flex-grow">
                            <SelectTrigger><SelectValue placeholder="Producto" /></SelectTrigger>
                            <SelectContent>
                                {allProducts.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} min="1" className="w-20" />
                        <Input type="number" value={item.price.toFixed(2)} onChange={(e) => handleItemChange(index, 'price', e.target.value)} step="0.01" className="w-24" />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={orderData.items.length <= 1}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
                </Button>
            </div>

            <div>
                <Label>Total Estimado del Pedido</Label>
                <Input type="text" value={`${orderData.totalAmount.toFixed(2)}`} disabled className="bg-gray-100 font-semibold"/>
            </div>

            <div>
                <Label htmlFor="assignedDistributorId">Asignar a Distribuidor</Label>
                <Select name="assignedDistributorId" value={orderData.assignedDistributorId} onValueChange={handleDistributorChange}>
                    <SelectTrigger><SelectValue placeholder="Seleccione un distribuidor" /></SelectTrigger>
                    <SelectContent>
                        {distributors.map(dist => (
                            <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div>
                <Label htmlFor="paymentMethod">Forma de Pago (Sugerida)</Label>
                 <Select name="paymentMethod" value={orderData.paymentMethod} onValueChange={(value) => setOrderData(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="credito">Crédito</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="observations">Observaciones Adicionales</Label>
                <textarea id="observations" name="observations" value={orderData.observations} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows="3"></textarea>
            </div>

            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{initialData ? 'Actualizar Pedido' : 'Crear Pedido'}</Button>
            </DialogFooter>
        </form>
    );
};

export default OrderForm;
