
import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Edit, Trash2, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from 'date-fns';

const AppointmentCard = React.memo(({ appointment, onEdit, onDelete, onStatusChange, isAdminOrOwner, customers }) => {
    const getStatusIconAndColor = React.useCallback(() => {
        switch (appointment.status) {
            case 'pending': return { icon: <Hourglass className="h-4 w-4" />, color: 'text-yellow-600 bg-yellow-100' };
            case 'completed': return { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600 bg-green-100' };
            case 'cancelled': return { icon: <XCircle className="h-4 w-4" />, color: 'text-red-600 bg-red-100' };
            default: return { icon: <CalendarDays className="h-4 w-4" />, color: 'text-gray-600 bg-gray-100' };
        }
    }, [appointment.status]);

    const { icon, color } = getStatusIconAndColor();
    const customerDetails = React.useMemo(() => customers.find(c => c.id === appointment.customerId), [customers, appointment.customerId]);

    return (
        <motion.div 
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col justify-between"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            layout // Add layout prop for smooth reordering if list changes
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-indigo-700">{appointment.customerName}</h3>
                    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${color}`}>
                        {icon} <span className="ml-1">{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                    </span>
                </div>
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-gray-400"/> {format(parseISO(appointment.appointmentDate), 'dd/MM/yyyy')}
                    <Clock className="h-4 w-4 ml-3 mr-1 text-gray-400"/> {appointment.appointmentTime}
                </p>
                {customerDetails?.address && <p className="text-xs text-gray-500">Dir: {customerDetails.address}</p>}
                {appointment.distributorName && <p className="text-xs text-gray-500 mb-1">Distribuidor: {appointment.distributorName}</p>}
                {appointment.notes && <p className="text-xs italic text-gray-500 mt-2 bg-gray-50 p-2 rounded-md">Notas: {appointment.notes}</p>}
            </div>
            {isAdminOrOwner && (
                <div className="flex justify-end space-x-2 mt-auto pt-3 border-t">
                    <Select value={appointment.status} onValueChange={(newStatus) => onStatusChange(appointment.id, newStatus)}>
                        <SelectTrigger className="text-xs h-8 w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="completed">Completada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(appointment)} title="Editar Cita">
                        <Edit className="h-4 w-4 text-yellow-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(appointment.id)} title="Eliminar Cita">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            )}
        </motion.div>
    );
});

export default AppointmentCard;
