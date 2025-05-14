
import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Search, Filter, List, Grid, Download, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { exportToCsv, exportToPdf } from '@/lib/exportUtils';

const CustomerForm = React.lazy(() => import('@/pages/app/customers/CustomerForm'));
const CustomerCardView = React.lazy(() => import('@/pages/app/customers/CustomerCardView'));
const CustomerListView = React.lazy(() => import('@/pages/app/customers/CustomerListView'));

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

const CustomersPage = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, isDataLoaded, reloadAllData } = useData();
  const { user, ROLES } = useAuth();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('card'); 

  const isDistributor = user?.role === ROLES.DISTRIBUTOR;

  useEffect(() => {
    if (isDataLoaded && document.visibilityState === 'visible') {
      reloadAllData(false, 'CustomersPage_visibility_focus'); 
    }
  }, [isDataLoaded, reloadAllData]);

  const handleFormSubmit = useCallback((customerData) => {
    if (editingCustomer) {
      updateCustomer({ ...editingCustomer, ...customerData });
    } else {
      addCustomer(customerData);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  }, [editingCustomer, addCustomer, updateCustomer]);

  const openEditModal = useCallback((customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  }, []);

  const handleDeleteCustomer = useCallback((customerId) => {
    if (window.confirm("¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.")) {
      deleteCustomer(customerId);
    }
  }, [deleteCustomer]);

  const filteredCustomers = useMemo(() => {
    if (!isDataLoaded) return [];
    return customers
      .filter(customer => {
        const typeMatch = filterType === 'all' || customer.type === filterType;
        const searchMatch = searchTerm === '' ||
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.ciRuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm) ||
          customer.whatsapp?.includes(searchTerm);
        return typeMatch && searchMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, searchTerm, filterType, isDataLoaded]);

  const handleWhatsApp = useCallback((whatsappNumber) => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } else {
      toast({ title: "WhatsApp no disponible", description: "El cliente no tiene un número de WhatsApp registrado." });
    }
  }, [toast]);

  const handleCall = useCallback((phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast({ title: "Teléfono no disponible", description: "El cliente no tiene un número de teléfono registrado." });
    }
  }, [toast]);

  const handleMap = useCallback((gps) => {
    if (gps && gps.lat && gps.lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lng}`, '_blank');
    } else {
      toast({ title: "Ubicación no disponible", description: "El cliente no tiene coordenadas GPS registradas." });
    }
  }, [toast]);

  const handleExportCsv = () => {
    exportToCsv(filteredCustomers, 'clientes');
  };

  const handleExportPdf = () => {
    exportToPdf(filteredCustomers, 'Lista de Clientes', ['ID', 'CI/RUC', 'Nombre', 'Tipo', 'Teléfono', 'Dirección'], 
      (customer) => [customer.id, customer.ciRuc, customer.name, customer.type, customer.phone, customer.address]
    );
  };

  if (!isDataLoaded) {
    return (
        <div className="flex justify-center items-center h-screen">
            <LoadingSpinner />
            <p className="ml-2">Cargando clientes...</p>
        </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center"><Users2 className="mr-3 text-blue-600 h-8 w-8"/>Gestión de Clientes</h1>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-5 w-5" /> Agregar Cliente
          </Button>
          <Button variant="outline" onClick={handleExportCsv} className="text-green-600 border-green-500 hover:bg-green-50">
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={handleExportPdf} className="text-red-600 border-red-500 hover:bg-red-50">
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) setEditingCustomer(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Editar' : 'Agregar Nuevo'} Cliente</DialogTitle>
            <DialogDescription>Complete la información del cliente.</DialogDescription>
          </DialogHeader>
          <Suspense fallback={<LoadingSpinner />}>
            <CustomerForm 
              customer={editingCustomer} 
              onSubmit={handleFormSubmit} 
              onCancel={() => { setIsModalOpen(false); setEditingCustomer(null); }}
              isDistributorView={isDistributor}
            />
          </Suspense>
        </DialogContent>
      </Dialog>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="relative md:col-span-1">
            <Label htmlFor="search-customer">Buscar Cliente</Label>
            <Search className="absolute left-3 top-9 transform text-gray-400 h-5 w-5" />
            <Input
              id="search-customer"
              placeholder="Nombre, CI/RUC, dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 mt-1"
            />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="filter-type">Tipo de Cliente</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="filter-type" className="mt-1"><Filter className="mr-2 h-4 w-4 text-gray-500 inline-block"/> <SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="consumidor final">Consumidor Final</SelectItem>
                <SelectItem value="negocio">Negocio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1 flex justify-end">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')} className="w-full md:w-auto">
              {viewMode === 'card' ? <List className="mr-2 h-5 w-5" /> : <Grid className="mr-2 h-5 w-5" />}
              Vista {viewMode === 'card' ? 'Lista' : 'Tarjeta'}
            </Button>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        {viewMode === 'card' ? (
          <CustomerCardView 
            customers={filteredCustomers} 
            onEdit={openEditModal} 
            onDelete={handleDeleteCustomer}
            onWhatsApp={handleWhatsApp}
            onMap={handleMap}
            onCall={handleCall}
          />
        ) : (
          <CustomerListView 
            customers={filteredCustomers} 
            onEdit={openEditModal} 
            onDelete={handleDeleteCustomer}
            onWhatsApp={handleWhatsApp}
            onMap={handleMap}
            onCall={handleCall}
          />
        )}
      </Suspense>
      {filteredCustomers.length === 0 && isDataLoaded && (
        <p className="text-center py-10 text-gray-500">No se encontraron clientes que coincidan con los filtros.</p>
      )}
    </motion.div>
  );
};

export default CustomersPage;
