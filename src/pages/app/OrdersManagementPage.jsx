
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Search, ClipboardList, User, ShoppingBag, DollarSign, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

const OrderItemInput = ({ item, index, products, onItemChange, onRemoveItem }) => {
    const selectedProduct = products.find(p => p.id === item.productId);
    return (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
            <Select 
                value={item.productId} 
                onValueChange={(value) => onItemChange(index, 'productId', value)}
            >
                <SelectTrigger className="flex-grow bg-white"><SelectValue placeholder="Producto" /></SelectTrigger>
                <SelectContent>
                    {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input 
                type="number" 
                value={item.quantity} 
                onChange={(e) => onItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)} 
                min="1"
                className="w-20 bg-white"
            />
            <Input 
                type="number" 
                value={item.price.toFixed(2)} 
                onChange={(e) => onItemChange(index, 'price', parseFloat(e.target.value) || 0)} 
                step="0.01"
                className="w-24 bg-white"
                disabled={!selectedProduct} 
            />
            <span className="w-24 text-sm font-semibold text-gray-700">
                Total: ${(item.quantity * item.price).toFixed(2)}
            </span>
            <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)}>
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
    );
};


const OrderForm = ({ order, onSubmit, onCancel }) => {
    const { customers, products: allProducts, distributors } = useData();
    const { user } = useAuth(); 
    const { toast } = useToast();

    const initialFormState = {
        customerId: '',
        customerName: '',
        customerAddress: '', 
        customerPhone: '', 
        items: [{ productId: '', quantity: 1, price: 0, productName: '' }],
        assignedDistributorId: '',
        assignedDistributorName: '',
        paymentMethod: 'efectivo', 
        observations: '',
        totalAmount: 0,
    };

    const [formData, setFormData] = useState(order ? 
        {
            ...order,
            items: order.items.map(item => ({...item, price: parseFloat(item.price) }) ) 
        } 
        : initialFormState
    );

    useEffect(() => {
        if (order) {
            setFormData({
                ...order,
                items: order.items.map(item => ({...item, price: parseFloat(item.price) }) )
            });
        } else {
            setFormData(initialFormState);
        }
    }, [order]);

    useEffect(() => {
        const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        setFormData(prev => ({ ...prev, totalAmount: total }));
    }, [formData.items]);

    const handleCustomerChange = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setFormData(prev => ({ 
                ...prev, 
                customerId, 
                customerName: customer.name,
                customerAddress: customer.address,
                customerPhone: customer.phone,
            }));
        }
    };

    const handleDistributorChange = (distributorId) => {
        const distributor = distributors.find(d => d.id === distributorId);
        if (distributor) {
            setFormData(prev => ({
                ...prev,
                assignedDistributorId: distributor.id,
                assignedDistributorName: distributor.name,
            }));
        }
    };
    
    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'productId') {
            const product = allProducts.find(p => p.id === value);
            newItems[index].price = product ? product.price : 0;
            newItems[index].productName = product ? product.name : '';
        }
        if (field === 'quantity' && value < 1) newItems[index].quantity = 1;
        if (field === 'price' && value < 0) newItems[index].price = 0;
        
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: '', quantity: 1, price: 0, productName: '' }]
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.customerId || !formData.assignedDistributorId || formData.items.some(item => !item.productId || item.quantity < 1)) {
            toast({ variant: "destructive", title: "Error", description: "Cliente, distribuidor y productos son requeridos."});
            return;
        }
        const finalItems = formData.items.map(item => ({
            productId: item.productId,
            productName: allProducts.find(p => p.id === item.productId)?.name || item.productName,
            quantity: parseInt(item.quantity, 10),
            price: parseFloat(item.price)
        }));

        onSubmit({ ...formData, items: finalItems, totalAmount: formData.totalAmount, createdBy: user.name });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="customerId">Cliente</Label>
                    <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                        <SelectTrigger><SelectValue placeholder="Seleccione un cliente" /></SelectTrigger>
                        <SelectContent>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.address}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {formData.customerAddress && <p className="text-xs text-gray-500 mt-1">Dirección: {formData.customerAddress}</p>}
                     {formData.customerPhone && <p className="text-xs text-gray-500 mt-1">Teléfono: {formData.customerPhone}</p>}
                </div>
                <div>
                    <Label htmlFor="assignedDistributorId">Asignar a Distribuidor</Label>
                    <Select value={formData.assignedDistributorId} onValueChange={handleDistributorChange}>
                        <SelectTrigger><SelectValue placeholder="Seleccione un distribuidor" /></SelectTrigger>
                        <SelectContent>
                            {distributors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label>Productos del Pedido</Label>
                <div className="space-y-2 mt-1">
                    {formData.items.map((item, index) => (
                        <OrderItemInput 
                            key={index}
                            item={item} 
                            index={index}
                            products={allProducts}
                            onItemChange={handleItemChange}
                            onRemoveItem={removeItem}
                        />
                    ))}
                </div>
                <Button type="button" variant="outline" onClick={addItem} className="mt-2 w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
                </Button>
            </div>
            
            <div>
                <Label htmlFor="paymentMethod">Forma de Pago (Sugerida para Distribuidor)</Label>
                <Select name="paymentMethod" value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
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
                <Textarea id="observations" name="observations" value={formData.observations} onChange={handleInputChange} placeholder="Ej: Entregar en portería, cliente prefiere envase nuevo, etc."/>
            </div>
            
            <div className="text-right font-bold text-xl">
                Total Estimado: ${formData.totalAmount.toFixed(2)}
            </div>

            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{order ? 'Actualizar' : 'Crear'} Pedido</Button>
            </DialogFooter>
        </form>
    );
};


const OrdersManagementPage = () => {
  const { managedOrders, addManagedOrder, updateManagedOrder, deleteManagedOrder, customers, distributors } = useData();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = useMemo(() => {
    return managedOrders
      .filter(order => {
        const statusMatch = filterStatus === 'all' || order.status === filterStatus;
        const searchMatch = searchTerm === '' ||
                            order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.assignedDistributorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.id.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [managedOrders, searchTerm, filterStatus]);

  const handleAddOrUpdateOrder = (orderData) => {
    if (editingOrder) {
      updateManagedOrder({ ...editingOrder, ...orderData });
    } else {
      addManagedOrder(orderData);
    }
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };
  
  const openAddModal = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  }

  const handleDeleteOrder = (orderId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este pedido?")) {
      deleteManagedOrder(orderId);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pendiente</span>;
      case 'assigned': return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Asignado</span>; 
      case 'in_progress': return <span className="px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">En Progreso</span>;
      case 'completed': return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Completado</span>;
      case 'cancelled': return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Cancelado</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">Desconocido</span>;
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center"><ClipboardList className="mr-3 h-8 w-8" />Gestión de Pedidos</h1>
        <Button onClick={openAddModal} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-5 w-5" /> Crear Pedido
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) setEditingOrder(null);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Editar' : 'Crear Nuevo'} Pedido</DialogTitle>
            <DialogDescription>
              {editingOrder ? 'Modifique los detalles del pedido.' : 'Complete los detalles para crear y asignar un nuevo pedido.'}
            </DialogDescription>
          </DialogHeader>
          <OrderForm
            order={editingOrder}
            onSubmit={handleAddOrUpdateOrder}
            onCancel={() => { setIsModalOpen(false); setEditingOrder(null); }}
          />
        </DialogContent>
      </Dialog>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Buscar por ID, cliente, distribuidor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger><SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
      </div>
      
      {filteredOrders.length === 0 ? (
         <p className="text-center py-8 text-gray-500">No se encontraron pedidos. Pruebe crear uno nuevo.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <Card key={order.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Pedido ID: {order.id.substring(order.id.length - 6)}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <CardDescription>
                    <CalendarDays className="inline h-4 w-4 mr-1" />{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="font-semibold text-gray-700"> <User className="inline h-4 w-4 mr-1" />Cliente: {order.customerName}</div>
                  <p className="text-gray-600">Dirección: {order.customerAddress}</p>
                  <p className="text-gray-600">Teléfono: {order.customerPhone}</p>
                  <div className="font-semibold text-gray-700"> <ShoppingBag className="inline h-4 w-4 mr-1" />Distribuidor: {order.assignedDistributorName}</div>
                  
                  <div className="pt-2 border-t">
                    <h4 className="font-medium mb-1">Productos:</h4>
                    <ul className="list-disc list-inside text-xs text-gray-600">
                        {order.items.map(item => (
                            <li key={item.productId}>{item.quantity}x {item.productName} (@ ${item.price.toFixed(2)})</li>
                        ))}
                    </ul>
                  </div>
                  {order.observations && <p className="text-xs text-gray-500 italic">Obs: {order.observations}</p>}
                  <div className="font-bold text-lg text-right text-blue-600"><DollarSign className="inline h-5 w-5" />Total: ${order.totalAmount.toFixed(2)}</div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex w-full justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(order)} title="Editar" disabled={order.status === 'completed'}>
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order.id)} title="Eliminar" className="text-red-500 hover:text-red-700" disabled={order.status === 'completed'}>
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}
    </motion.div>
  );
};

export default OrdersManagementPage;
