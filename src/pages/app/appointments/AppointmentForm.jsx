
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MessageSquare, MapPin, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import CustomerForm from '@/pages/app/customers/CustomerForm';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from 'date-fns';

const AppointmentForm = React.memo(({ onSubmit, onCancel, initialData, customers, distributors, isAdmin, addCustomer }) => {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    const defaultState = useMemo(() => ({
        customerId: '',
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        customerGps: null,
        distributorId: isAdmin ? '' : currentUser?.id,
        distributorName: isAdmin ? '' : currentUser?.name,
        appointmentDate: '',
        appointmentTime: '',
        notes: '',
        status: 'pending', 
    }), [isAdmin, currentUser]);

    const [formData, setFormData] = useState(initialData ? 
        {
            ...initialData,
            appointmentDate: initialData.appointmentDate ? format(parseISO(initialData.appointmentDate), 'yyyy-MM-dd') : '',
            appointmentTime: initialData.appointmentTime || (initialData.appointmentDate ? format(parseISO(initialData.appointmentDate), 'HH:mm') : ''),
            customerAddress: customers.find(c => c.id === initialData.customerId)?.address || '',
            customerPhone: customers.find(c => c.id === initialData.customerId)?.phone || '',
            customerGps: customers.find(c => c.id === initialData.customerId)?.gps || null,
        } 
        : defaultState
    );
    
    useEffect(() => {
        if (initialData) {
            const customer = customers.find(c => c.id === initialData.customerId);
            setFormData({
                ...initialData,
                appointmentDate: initialData.appointmentDate ? format(parseISO(initialData.appointmentDate), 'yyyy-MM-dd') : '',
                appointmentTime: initialData.appointmentTime || (initialData.appointmentDate ? format(parseISO(initialData.appointmentDate), 'HH:mm') : ''),
                customerAddress: customer?.address || '',
                customerPhone: customer?.phone || '',
                customerGps: customer?.gps || null,
            });
        } else {
            setFormData(defaultState);
        }
    }, [initialData, defaultState, customers]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'customerId') {
            const customer = customers.find(c => c.id === value);
            setFormData(prev => ({ 
                ...prev, 
                customerName: customer?.name || '',
                customerAddress: customer?.address || '',
                customerPhone: customer?.phone || '',
                customerGps: customer?.gps || null,
            }));
        }
        if (name === 'distributorId') {
            const distributor = distributors.find(d => d.id === value);
            setFormData(prev => ({ ...prev, distributorName: distributor?.name || '' }));
        }
    }, [customers, distributors]);

    const handleSubmitForm = useCallback(async (e) => {
        e.preventDefault();
        if (!formData.customerId || !formData.appointmentDate || !formData.appointmentTime) {
            toast({ variant: "destructive", title: "Campos requeridos", description: "Cliente, fecha y hora son obligatorios." });
            return;
        }
        if (isAdmin && !formData.distributorId) {
            toast({ variant: "destructive", title: "Distribuidor requerido", description: "Por favor, seleccione un distribuidor." });
            return;
        }
        
        const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
        await onSubmit({ ...formData, appointmentDate: appointmentDateTime.toISOString() });
    }, [formData, isAdmin, onSubmit, toast]);
    
    const openWhatsApp = useCallback(() => {
        if (formData.customerPhone) {
            const phoneNumber = formData.customerPhone.replace(/\D/g, '');
            const message = `Hola ${formData.customerName}, le recordamos su cita con Bijao Water para el ${formData.appointmentDate ? format(parseISO(formData.appointmentDate), 'dd/MM/yyyy') : ''} a las ${formData.appointmentTime}.`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            toast({ variant: "destructive", title: "Sin número", description: "El cliente no tiene un número de WhatsApp registrado." });
        }
    }, [formData.customerPhone, formData.customerName, formData.appointmentDate, formData.appointmentTime, toast]);

    const openMap = useCallback(() => {
        if (formData.customerGps && formData.customerGps.lat && formData.customerGps.lng) {
            window.open(`https://www.openstreetmap.org/?mlat=${formData.customerGps.lat}&mlon=${formData.customerGps.lng}#map=16/${formData.customerGps.lat}/${formData.customerGps.lng}`, '_blank');
        } else {
            toast({ variant: "destructive", title: "Sin GPS", description: "El cliente no tiene coordenadas GPS registradas." });
        }
    }, [formData.customerGps, toast]);

    const handleAddNewCustomer = async (newCustomerData) => {
        const result = await addCustomer(newCustomerData);
        if (result && result.data && !result.error) {
            toast({ title: "Cliente Agregado", description: `${result.data.name} ha sido agregado con éxito.` });
            setIsCustomerModalOpen(false);
            // Automatically select the new customer
            handleSelectChange('customerId', result.data.id);
        } else {
            toast({ variant: "destructive", title: "Error", description: "No se pudo agregar el cliente." });
        }
    };

    return (
        <>
            <form onSubmit={handleSubmitForm} className="space-y-4 py-4 max-h-[75vh] overflow-y-auto p-1 custom-scrollbar">
                <div className="flex items-end gap-2">
                    <div className="flex-grow">
                        <Label htmlFor="customerId">Cliente</Label>
                        <Select name="customerId" value={formData.customerId} onValueChange={(value) => handleSelectChange('customerId', value)}>
                            <SelectTrigger><SelectValue placeholder="Seleccione un cliente" /></SelectTrigger>
                            <SelectContent>
                                {customers.map(cust => (
                                    <SelectItem key={cust.id} value={cust.id}>{cust.name} ({cust.address || 'Dirección N/A'})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="button" variant="outline" onClick={() => setIsCustomerModalOpen(true)} title="Registrar Nuevo Cliente">
                        <UserPlus className="h-4 w-4" />
                    </Button>
                </div>
                {formData.customerId && (
                     <div className="text-sm p-2 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="font-medium text-gray-700">Info Cliente:</p>
                        <p className="text-xs text-gray-600">Dirección: {formData.customerAddress}</p>
                        <p className="text-xs text-gray-600">Teléfono: {formData.customerPhone}</p>
                         <div className="flex space-x-1 mt-1">
                            <Button type="button" variant="ghost" size="icon" onClick={openWhatsApp} title="Contactar por WhatsApp" disabled={!formData.customerPhone}>
                                <MessageSquare className={`h-4 w-4 ${formData.customerPhone ? 'text-green-500' : 'text-gray-400'}`} />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={openMap} title="Ver en Mapa" disabled={!formData.customerGps?.lat}>
                                <MapPin className={`h-4 w-4 ${formData.customerGps?.lat ? 'text-blue-500' : 'text-gray-400'}`} />
                            </Button>
                        </div>
                    </div>
                )}
                {isAdmin && (
                    <div>
                        <Label htmlFor="distributorId">Distribuidor Asignado</Label>
                        <Select name="distributorId" value={formData.distributorId} onValueChange={(value) => handleSelectChange('distributorId', value)}>
                            <SelectTrigger><SelectValue placeholder="Seleccione un distribuidor" /></SelectTrigger>
                            <SelectContent>
                            {distributors.map(dist => (
                                <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="appointmentDate">Fecha de Visita</Label>
                        <Input id="appointmentDate" name="appointmentDate" type="date" value={formData.appointmentDate} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="appointmentTime">Hora de Visita</Label>
                        <Input id="appointmentTime" name="appointmentTime" type="time" value={formData.appointmentTime} onChange={handleInputChange} />
                    </div>
                </div>
                <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="completed">Completada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows="3" placeholder="Recordatorios, detalles específicos..."/>
                </div>
                <div className="pt-4 border-t mt-4 flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">{initialData ? 'Actualizar' : 'Agendar'} Visita</Button>
                </div>
            </form>

            <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del nuevo cliente.
                        </DialogDescription>
                    </DialogHeader>
                    <CustomerForm 
                        onSubmit={handleAddNewCustomer}
                        onCancel={() => setIsCustomerModalOpen(false)}
                        isDistributorView={!isAdmin} 
                    />
                </DialogContent>
            </Dialog>
        </>
    );
});

export default AppointmentForm;
