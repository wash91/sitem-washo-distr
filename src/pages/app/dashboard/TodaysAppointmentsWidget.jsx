
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck, User, Hourglass, CheckCircle, XCircle, Users } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { format, parseISO, startOfToday, endOfToday, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

const AppointmentStatusIcon = ({ status }) => {
  if (status === 'pending') return <Hourglass className="h-4 w-4 text-yellow-500 mr-2" />;
  if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-500 mr-2" />;
  if (status === 'cancelled') return <XCircle className="h-4 w-4 text-red-500 mr-2" />;
  return null;
};

const TodaysAppointmentsWidget = () => {
  const { appointments, distributors, customers, isLoading, isDataLoaded } = useData();

  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const todaysAppointmentsByDistributor = useMemo(() => {
    if (!isDataLoaded || !appointments || !distributors || !customers) {
      return [];
    }

    const filteredAppointments = appointments.filter(app => {
      const appDate = parseISO(app.appointmentDate);
      return isWithinInterval(appDate, { start: todayStart, end: todayEnd });
    });

    const groupedByDistributor = distributors.map(distributor => {
      const distributorAppointments = filteredAppointments
        .filter(app => app.distributorId === distributor.id)
        .map(app => {
          const customer = customers.find(c => c.id === app.customerId);
          return {
            ...app,
            customerName: customer?.name || app.customerName || 'Cliente Desconocido',
            customerAddress: customer?.address || app.customerAddress || 'Dirección N/A',
          };
        })
        .sort((a,b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''));
      
      return {
        distributorId: distributor.id,
        distributorName: distributor.name,
        appointments: distributorAppointments,
        hasAppointmentsToday: distributorAppointments.length > 0,
      };
    }).filter(d => d.hasAppointmentsToday); // Only include distributors with appointments today

    return groupedByDistributor.sort((a,b) => a.distributorName.localeCompare(b.distributorName));

  }, [appointments, distributors, customers, isDataLoaded, todayStart, todayEnd]);

  if (isLoading && !isDataLoaded) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CalendarCheck className="mr-2 h-5 w-5 text-purple-500" /> Visitas Programadas para Hoy
          </CardTitle>
          <CardDescription>Resumen de visitas por distribuidor.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Cargando visitas de hoy...</p>
        </CardContent>
      </Card>
    );
  }

  if (todaysAppointmentsByDistributor.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CalendarCheck className="mr-2 h-5 w-5 text-purple-500" /> Visitas Programadas para Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No hay visitas programadas para hoy para ningún distribuidor.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md col-span-1 md:col-span-2 lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Users className="mr-3 h-6 w-6 text-purple-500" /> Visitas Programadas para Hoy por Distribuidor
        </CardTitle>
        <CardDescription>
          Fecha: {format(new Date(), "eeee, dd 'de' MMMM 'de' yyyy", { locale: es })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar p-4">
        {todaysAppointmentsByDistributor.map(distributorData => (
          <div key={distributorData.distributorId} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0">
            <h3 className="text-lg font-semibold text-indigo-700 flex items-center mb-2">
              <User className="mr-2 h-5 w-5" /> {distributorData.distributorName}
            </h3>
            {distributorData.appointments.length > 0 ? (
              <ul className="space-y-2 pl-2">
                {distributorData.appointments.map(app => (
                  <li key={app.id} className="p-3 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{app.customerName}</span>
                      <span className="text-xs text-gray-500">{app.appointmentTime}</span>
                    </div>
                    <p className="text-xs text-gray-600">{app.customerAddress}</p>
                    <div className="flex items-center mt-1">
                      <AppointmentStatusIcon status={app.status} />
                      <span className={`text-xs font-medium ${
                        app.status === 'pending' ? 'text-yellow-600' :
                        app.status === 'completed' ? 'text-green-600' :
                        app.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 pl-2">No tiene visitas programadas para hoy.</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TodaysAppointmentsWidget;
