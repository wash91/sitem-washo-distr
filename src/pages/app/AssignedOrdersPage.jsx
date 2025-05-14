
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, CheckCircle, XCircle, Search, CalendarDays, User, Phone, MapPin, DollarSign, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import AssignedOrderCard from '@/pages/app/orders/AssignedOrderCard';
import SaleFromOrderModal from '@/pages/app/orders/SaleFromOrderModal';

const AssignedOrdersPage = () => {
  const { 
    managedOrders, 
    updateManagedOrder, 
    addSale, 
    products: allProductsFromContext, 
    getTruckInventoryForDistributor, 
    cashOpenings,
    isDataLoaded,
    reloadAllData
  } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [currentOrderForSale, setCurrentOrderForSale] = useState(null);
  
  useEffect(() => {
    if (isDataLoaded) {
      reloadAllData(); 
    }
  }, [isDataLoaded, reloadAllData]);

  const truckInventory = useMemo(() => {
    if (user?.id && isDataLoaded) {
        return getTruckInventoryForDistributor(user.id);
    }
    return [];
  }, [getTruckInventoryForDistributor, user?.id, cashOpenings, managedOrders, isDataLoaded]);

  const assignedToMeOrders = useMemo(() => {
    if (!isDataLoaded) return [];
    return managedOrders
      .filter(order => order.assignedDistributorId === user?.id && order.status !== 'completed' && order.status !== 'cancelled')
      .filter(order => 
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [managedOrders, user?.id, searchTerm, isDataLoaded]);

  const openSaleModal = (order) => {
    setCurrentOrderForSale(order);
    setIsSaleModalOpen(true);
  };
  
  const handleRegisterSale = (saleDataFromModal) => {
    if (!currentOrderForSale) return;
    
    const itemsToSell = saleDataFromModal.items.filter(item => item.quantity > 0);

    if (itemsToSell.length === 0 && (!saleDataFromModal.observations || saleDataFromModal.observations.trim() === '')) {
        toast({ variant: "destructive", title: "Venta Vacía", description: "Debe vender al menos un producto o registrar una observación." });
        return;
    }
    
    for (const item of itemsToSell) {
        const productInInventory = truckInventory.find(p => p.productId === item.productId);
        if (!productInInventory || productInInventory.quantity < item.quantity) {
            const currentProductDetails = allProductsFromContext.find(p => p.id === item.productId);
            toast({ variant: "destructive", title: "Error de inventario", description: `No hay suficiente stock de ${currentProductDetails?.name || item.productName} en el camión. Stock actual: ${productInInventory?.quantity || 0}` });
            return;
        }
    }
    
    const saleData = {
      customerId: currentOrderForSale.customerId,
      customerName: currentOrderForSale.customerName,
      customerAddress: currentOrderForSale.customerAddress,
      customerPhone: currentOrderForSale.customerPhone,
      items: itemsToSell.map(item => ({
          productId: item.productId,
          productName: allProductsFromContext.find(p => p.id === item.productId)?.name || item.productName,
          quantity: item.quantity,
          price: item.price,
      })),
      totalAmount: itemsToSell.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      paymentMethod: saleDataFromModal.paymentMethod,
      amountPaid: saleDataFromModal.paymentMethod === 'credito' ? 0 : itemsToSell.reduce((sum, item) => sum + (item.quantity * item.price), 0),
      amountCredit: saleDataFromModal.paymentMethod === 'credito' ? itemsToSell.reduce((sum, item) => sum + (item.quantity * item.price), 0) : 0,
      observations: saleDataFromModal.observations || `Venta generada desde pedido ${currentOrderForSale.id}`,
      distributorId: user?.id,
      distributorName: user?.name,
    };
    
    addSale(saleData, currentOrderForSale.id);
    
    setIsSaleModalOpen(false);
    setCurrentOrderForSale(null);
    toast({ title: "Venta Registrada", description: "La venta ha sido registrada y el pedido actualizado." });
  };
  
  const handleMarkAsCancelled = (orderId, cancellationReason) => {
      if (window.confirm("¿Está seguro de que desea marcar este pedido como no entregado/cancelado?")) {
        updateManagedOrder({ 
            id: orderId, 
            status: 'cancelled', 
            observations: `Cancelado por ${user?.name || 'distribuidor'}: ${cancellationReason || 'Motivo no especificado'}` 
        });
        toast({ title: "Pedido Actualizado", description: "El pedido ha sido marcado como cancelado." });
      }
  };

  if (!isDataLoaded) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Cargando pedidos asignados...</p>
        </div>
    );
  }

  if (assignedToMeOrders.length === 0 && searchTerm === '') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-4 flex flex-col items-center justify-center h-[calc(100vh-10rem)]"
      >
        <ShoppingBag className="h-20 w-20 text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-gray-700 mb-3">Sin Pedidos Asignados</h1>
        <p className="text-gray-500 text-center max-w-md">Actualmente no tienes pedidos pendientes de entrega. ¡Buen trabajo o espera nuevas asignaciones!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
          <ShoppingBag className="mr-3 h-8 w-8 text-blue-600" />Mis Pedidos Asignados
        </h1>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Buscar por cliente, ID, dirección..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-72"
          />
        </div>
      </div>
      
      {assignedToMeOrders.length === 0 && searchTerm !== '' && (
         <p className="text-center py-8 text-gray-500">No se encontraron pedidos con los criterios de búsqueda.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedToMeOrders.map(order => (
          <AssignedOrderCard 
            key={order.id} 
            order={order} 
            onOpenSaleModal={openSaleModal}
            onMarkAsCancelled={handleMarkAsCancelled} 
          />
        ))}
      </div>

      {currentOrderForSale && (
        <SaleFromOrderModal
          isOpen={isSaleModalOpen}
          onClose={() => { setIsSaleModalOpen(false); setCurrentOrderForSale(null); }}
          order={currentOrderForSale}
          onSubmitSale={handleRegisterSale}
          allProducts={allProductsFromContext}
        />
      )}
    </motion.div>
  );
};

export default AssignedOrdersPage;
