
import { v4 as uuidv4 } from 'uuid';

export const appointmentHandler = (user, appointments, setAndSaveAppointments, toast, deleteAppointmentSupabase) => {
    const addAppointment = async (appointmentData) => {
        if (!user) {
            toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
            return { error: { message: "User not authenticated" }};
        }
        const newAppointment = {
            id: uuidv4(),
            ...appointmentData,
            distributor_id: appointmentData.distributor_id || (user.role !== 'admin' ? user.id : null), // Assign to current user if distributor
            status: appointmentData.status || 'Pendiente',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data: result, error } = await setAndSaveAppointments(prev => [...prev, newAppointment]);
        if (error) {
            toast({ title: "Error", description: `No se pudo agendar la visita. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Visita Agendada", description: `Visita para ${newAppointment.customer_name} agendada.` });
        }
        return { data: result ? result.find(a => a.id === newAppointment.id) : newAppointment, error };
    };

    const updateAppointment = async (appointmentId, updatedData) => {
        const appointmentToUpdate = {
            ...updatedData,
            id: appointmentId,
            updated_at: new Date().toISOString(),
        };
        const { data: result, error } = await setAndSaveAppointments(prev =>
            prev.map(a => a.id === appointmentId ? { ...a, ...appointmentToUpdate } : a)
        );

        if (error) {
            toast({ title: "Error", description: `No se pudo actualizar la visita. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Visita Actualizada", description: "Datos de la visita actualizados." });
        }
        return { data: result ? result.find(a => a.id === appointmentId) : appointmentToUpdate, error };
    };
    
    const deleteAppointment = async (appointmentId) => {
        const { error } = await deleteAppointmentSupabase(appointmentId);
        if (error) {
            toast({ title: "Error", description: `No se pudo eliminar la visita. ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Visita Eliminada", description: "La visita ha sido eliminada.", variant: "destructive" });
        }
        return { error };
    };

    const getAppointmentsByDistributor = (distributorId) => {
        return appointments.filter(a => a.distributor_id === distributorId);
    };
    
    const getAllAppointments = () => appointments;

    return {
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getAppointmentsByDistributor,
        getAllAppointments
    };
};
