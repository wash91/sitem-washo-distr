
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Search, ShoppingBag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';
import OrderForm from '@/pages/app/orders/OrderForm';
import OrderCard from '@/pages/app/orders/OrderCard';

const OrdersManagementPage = () => {
    const { 
        managedOrders, 
        addManagedOrder, 
        updateManagedOrder, 
        deleteManagedOrder, 
        customers, 
        products: allProducts, 
        distributors,
        isDataLoaded,
        reloadAllData
    } = useData();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDistributor, setFilterDistributor] = useState('all');

    useEffect(() => {
        if (isDataLoaded) {
          reloadAllData(); 
        }
    }, [isDataLoaded, reloadAllData]);

    const handleFormSubmit = (data) => {
        if (editingOrder) {
            updateManagedOrder({ ...editingOrder, ...data });
        } else {
            addManagedOrder(data);
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
    };

    const statusTranslations = {
        pending: 'Pendiente',
        assigned: 'Asignado',
        in_progress: 'En Progreso',
        completed: 'Completado',
        cancelled: 'Cancelado',
    };

    const filteredOrders = useMemo(() => {
        if (!isDataLoaded) return [];
        return managedOrders
            .filter(order => {
                const searchMatch = searchTerm === '' ||
                    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.assignedDistributorName?.toLowerCase().includes(searchTerm.toLowerCase());
                const statusMatch = filterStatus === 'all' || order.status === filterStatus;
                const distributorMatch = filterDistributor === 'all' || order.assignedDistributorId === filterDistributor;
                return searchMatch && statusMatch && distributorMatch;
            })
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }, [managedOrders, searchTerm, filterStatus, filterDistributor, isDataLoaded]);

    if (!isDataLoaded) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Cargando datos de pedidos...</p>
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
                <h1 className="text-3xl font-bold text-gray-800 flex items-center"><ShoppingBag className="mr-3 text-blue-600 h-8 w-8"/>Gestión de Pedidos</h1>
                <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Pedido
                </Button>
            </div>

            <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
                setIsModalOpen(isOpen);
                if (!isOpen) setEditingOrder(null);
            }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingOrder ? 'Editar' : 'Crear Nuevo'} Pedido</DialogTitle>
                        <DialogDescription>Complete los detalles del pedido y asigne un distribuidor.</DialogDescription>
                    </DialogHeader>
                    <OrderForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => { setIsModalOpen(false); setEditingOrder(null); }}
                        initialData={editingOrder}
                        customers={customers}
                        allProducts={allProducts}
                        distributors={distributors}
                        navigate={navigate}
                    />
                </DialogContent>
            </Dialog>

            <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Buscar por cliente, ID, distribuidor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger><Filter className="mr-2 h-4 w-4 text-gray-500 inline-block"/> <SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            {Object.entries(statusTranslations).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterDistributor} onValueChange={setFilterDistributor}>
                        <SelectTrigger><Filter className="mr-2 h-4 w-4 text-gray-500 inline-block"/> <SelectValue placeholder="Filtrar por distribuidor" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Distribuidores</SelectItem>
                            {distributors.map(dist => (
                                <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map(order => (
                    <OrderCard 
                        key={order.id}
                        order={order}
                        onEdit={openEditModal}
                        onDelete={deleteManagedOrder}
                        statusTranslations={statusTranslations}
                    />
                ))}
            </div>
            {filteredOrders.length === 0 && (
                <p className="text-center py-10 text-gray-500">No se encontraron pedidos que coincidan con los filtros.</p>
            )}
        </motion.div>
    );
};

export default OrdersManagementPage;
