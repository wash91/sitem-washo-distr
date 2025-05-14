
import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import AppointmentFilters from '@/pages/app/appointments/AppointmentFilters';

const AppointmentForm = React.lazy(() => import('@/pages/app/appointments/AppointmentForm'));
const AppointmentCard = React.lazy(() => import('@/pages/app/appointments/AppointmentCard'));

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

const AppointmentsPage = () => {
    const { 
        appointments, addAppointment, updateAppointment: updateAppointmentContext, deleteAppointment, 
        customers, distributors, isDataLoaded, reloadAllData, addCustomer 
    } = useData();
    const { user, ROLES, hasPermission } = useAuth();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDistributor, setFilterDistributor] = useState(user?.role === ROLES.ADMIN ? 'all' : user?.id);

    const isAdmin = user?.role === ROLES.ADMIN;
    const canManageAppointments = hasPermission('manageAppointments');

    useEffect(() => {
        if (isDataLoaded && document.visibilityState === 'visible') {
          reloadAllData(false, 'AppointmentsPage_visibility_focus'); 
        }
    }, [isDataLoaded, reloadAllData]);

    const handleFormSubmit = useCallback(async (data) => {
        let result;
        if (editingAppointment) {
            result = await updateAppointmentContext(editingAppointment.id, data);
        } else {
            result = await addAppointment(data);
        }

        if (result && !result.error) {
            setIsModalOpen(false);
            setEditingAppointment(null);
        }
    }, [editingAppointment, addAppointment, updateAppointmentContext]);

    const openEditModal = useCallback((appointment) => {
        setEditingAppointment(appointment);
        setIsModalOpen(true);
    }, []);

    const openAddModal = useCallback(() => {
        setEditingAppointment(null);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (appointmentId) => {
        if (window.confirm("¿Está seguro que desea eliminar esta cita?")) {
            await deleteAppointment(appointmentId);
        }
    }, [deleteAppointment]);

    const handleStatusChange = useCallback(async (appointmentId, newStatus) => {
        const appointmentToUpdate = appointments.find(app => app.id === appointmentId);
        if (appointmentToUpdate) {
            const result = await updateAppointmentContext(appointmentId, { ...appointmentToUpdate, status: newStatus });
            if (result && !result.error) {
                toast({ title: "Estado Actualizado", description: `La cita ha sido marcada como ${newStatus}.` });
            }
        }
    }, [appointments, updateAppointmentContext, toast]);

    const filteredAppointments = useMemo(() => {
        if (!isDataLoaded) return [];
        return appointments
            .filter(app => {
                const searchMatch = searchTerm === '' ||
                    app.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.distributorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.notes?.toLowerCase().includes(searchTerm.toLowerCase());
                const statusMatch = filterStatus === 'all' || app.status === filterStatus;
                
                let distributorMatch = true;
                if (isAdmin) { 
                    if (filterDistributor !== 'all') {
                         distributorMatch = app.distributorId === filterDistributor;
                    }
                } else { 
                    distributorMatch = app.distributorId === user?.id;
                }
                return searchMatch && statusMatch && distributorMatch;
            })
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    }, [appointments, searchTerm, filterStatus, filterDistributor, user, isAdmin, isDataLoaded]);

    if (!isDataLoaded) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
                <p className="ml-2">Cargando agendamiento...</p>
            </div>
        );
    }
    
    if(!canManageAppointments && !isAdmin) {
         return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-500">No tiene permiso para acceder a este módulo.</p>
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
                <h1 className="text-3xl font-bold text-gray-800 flex items-center"><CalendarDays className="mr-3 text-purple-600 h-8 w-8"/>Agendamiento de Visitas</h1>
                <Button onClick={openAddModal} className="bg-purple-600 hover:bg-purple-700">
                    <CalendarPlus className="mr-2 h-5 w-5" /> Agendar Nueva Visita
                </Button>
            </div>

            <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
                setIsModalOpen(isOpen);
                if (!isOpen) setEditingAppointment(null);
            }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingAppointment ? 'Editar' : 'Agendar Nueva'} Visita</DialogTitle>
                        <DialogDescription>Planifique las visitas a sus clientes.</DialogDescription>
                    </DialogHeader>
                    <Suspense fallback={<LoadingSpinner />}>
                        <AppointmentForm
                            onSubmit={handleFormSubmit}
                            onCancel={() => { setIsModalOpen(false); setEditingAppointment(null); }}
                            initialData={editingAppointment}
                            customers={customers}
                            distributors={distributors}
                            isAdmin={isAdmin}
                            addCustomer={addCustomer}
                        />
                    </Suspense>
                </DialogContent>
            </Dialog>

            <AppointmentFilters
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
                filterDistributor={filterDistributor}
                onFilterDistributorChange={setFilterDistributor}
                distributors={distributors}
                isAdmin={isAdmin}
            />
            
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><LoadingSpinner /><LoadingSpinner /><LoadingSpinner /></div>}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAppointments.map(app => (
                        <AppointmentCard 
                            key={app.id}
                            appointment={app}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                            isAdminOrOwner={isAdmin || app.distributorId === user?.id}
                            customers={customers}
                        />
                    ))}
                </div>
            </Suspense>
            {filteredAppointments.length === 0 && !isDataLoaded && <LoadingSpinner/>}
            {filteredAppointments.length === 0 && isDataLoaded && (
                <p className="text-center py-10 text-gray-500">No se encontraron citas que coincidan con los filtros.</p>
            )}
        </motion.div>
    );
};

export default AppointmentsPage;
