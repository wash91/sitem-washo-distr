
import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Search as SearchIconLucide, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import SalesList from '@/pages/app/sales/SalesList';
import { useNavigate } from 'react-router-dom';

const SalesForm = React.lazy(() => import('@/pages/app/sales/SalesForm'));

const LoadingComponent = ({ message = "Cargando..."}) => (
    <div className="flex justify-center items-center h-full">
        <div className="text-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            ></motion.div>
            <p className="text-lg font-semibold text-gray-700">{message}</p>
        </div>
    </div>
);

const SalesPageFilters = React.memo(({ listSearchTerm, setListSearchTerm, filterClient, setFilterClient, filterPayment, setFilterPayment, customers }) => (
  <div className="mb-6 p-4 bg-white rounded-lg shadow">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <SearchIconLucide className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input 
          placeholder="Buscar por cliente, producto..." 
          value={listSearchTerm}
          onChange={(e) => setListSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={filterClient} onValueChange={setFilterClient}>
        <SelectTrigger> <SelectValue placeholder="Filtrar por cliente" /> </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Clientes</SelectItem>
          {customers.map(customer => (
            <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterPayment} onValueChange={setFilterPayment}>
        <SelectTrigger> <SelectValue placeholder="Filtrar por forma de pago" /> </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las Formas de Pago</SelectItem>
          <SelectItem value="efectivo">Efectivo</SelectItem>
          <SelectItem value="credito">Crédito</SelectItem>
          <SelectItem value="transferencia">Transferencia</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
));

const SalesPageHeader = React.memo(({ onOpenModal }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><ShoppingCartIcon className="mr-3 h-8 w-8" />Ventas Registradas</h1>
    <Button onClick={onOpenModal} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
      <PlusCircle className="mr-2 h-5 w-5" /> Registrar Venta Directa
    </Button>
  </div>
));


const SalesPage = () => {
  const { 
    sales, 
    addSale, 
    customers, 
    products: allProductsFromContext, 
    getTruckInventoryForDistributor,
    cashOpenings,
    isDataLoaded,
    reloadAllData
  } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  
  useEffect(() => {
    if (isDataLoaded && document.visibilityState === 'visible') {
      reloadAllData(false, 'SalesPage_visibility_focus'); 
    }
  }, [isDataLoaded, reloadAllData]);

  const initialSaleState = useMemo(() => ({
    customerId: '',
    customerName: '', 
    items: [{ productId: '', quantity: 1, price: 0, productName: '' }],
    paymentMethod: 'efectivo',
    amountPaid: 0,
    amountCredit: 0,
    observations: '',
    totalAmount: 0,
    distributorId: user?.id,
    distributorName: user?.name,
  }), [user]);

  const truckInventory = useMemo(() => {
    if (user?.id && isDataLoaded) {
      return getTruckInventoryForDistributor(user.id);
    }
    return [];
  }, [getTruckInventoryForDistributor, user?.id, cashOpenings, sales, isDataLoaded]);

  const productsAvailableForSale = useMemo(() => {
    if (!isDataLoaded) return [];
    if (user?.role === 'distributor') {
        if (truckInventory && truckInventory.length > 0) {
            return truckInventory.map(invItem => {
                const productDetail = allProductsFromContext.find(p => p.id === invItem.productId);
                return {
                    ...productDetail, 
                    stock: invItem.quantity, 
                    name: invItem.productName || productDetail?.name || 'Producto Desconocido'
                };
            }).filter(p => p.id && p.stock > 0); 
        }
        return []; 
    }
    return allProductsFromContext; 
  }, [user?.role, truckInventory, allProductsFromContext, isDataLoaded]);


  const handleSubmitNewSale = useCallback((saleData, fromOrderId = null) => {
    addSale(saleData, fromOrderId); 
    setIsModalOpen(false);
  }, [addSale]);

  const filteredSales = useMemo(() => {
    if (!isDataLoaded || !sales) return [];
    return sales
      .filter(sale => {
        const clientMatch = filterClient === 'all' || sale.customerId === filterClient;
        const paymentMatch = filterPayment === 'all' || sale.paymentMethod === filterPayment;
        
        const saleProductsString = sale.items?.map(item => item.productName || allProductsFromContext.find(p=>p.id === item.productId)?.name).join(' ').toLowerCase() || '';

        const searchMatch = listSearchTerm === '' || 
                            sale.customerName?.toLowerCase().includes(listSearchTerm.toLowerCase()) ||
                            saleProductsString.includes(listSearchTerm.toLowerCase());
        return clientMatch && paymentMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sales, listSearchTerm, filterClient, filterPayment, allProductsFromContext, isDataLoaded]);


  if (!isDataLoaded) {
    return <LoadingComponent message="Cargando datos de ventas..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto p-4 flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.20))]"
    >
      <SalesPageHeader onOpenModal={() => setIsModalOpen(true)} />
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Registrar Nueva Venta Directa</DialogTitle>
            <DialogDescription>Complete los detalles de la venta. Busque un cliente o cree uno nuevo.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto px-6 custom-scrollbar">
            <Suspense fallback={<LoadingComponent message="Cargando formulario..." />}>
                <SalesForm 
                    onSubmit={handleSubmitNewSale}
                    onCancel={() => setIsModalOpen(false)}
                    initialSaleData={initialSaleState}
                    customers={customers}
                    allProducts={productsAvailableForSale}
                    truckInventory={truckInventory} 
                    navigate={navigate}
                />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>

      <SalesPageFilters 
        listSearchTerm={listSearchTerm}
        setListSearchTerm={setListSearchTerm}
        filterClient={filterClient}
        setFilterClient={setFilterClient}
        filterPayment={filterPayment}
        setFilterPayment={setFilterPayment}
        customers={customers}
      />
      
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <SalesList sales={filteredSales} allProducts={allProductsFromContext} />
      </div>

    </motion.div>
  );
};

export default SalesPage;
