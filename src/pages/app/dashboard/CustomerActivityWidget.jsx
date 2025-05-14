
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { differenceInDays, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FREQUENCY_THRESHOLDS = {
  REGULAR: 7, // Visited within the last 7 days
  INFREQUENT: 30, // Visited within the last 30 days but not 7
  // INACTIVE: implicit, more than 30 days
};

const getCustomerActivityStatus = (lastVisitDate) => {
  if (!lastVisitDate) return 'inactive';
  const daysSinceLastVisit = differenceInDays(new Date(), parseISO(lastVisitDate));
  if (daysSinceLastVisit <= FREQUENCY_THRESHOLDS.REGULAR) return 'regular';
  if (daysSinceLastVisit <= FREQUENCY_THRESHOLDS.INFREQUENT) return 'infrequent';
  return 'inactive';
};

const CustomerActivityItem = ({ customer, status }) => {
  const statusConfig = {
    regular: {
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'Actividad Regular',
    },
    infrequent: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      icon: <AlertTriangle className="h-4 w-4" />,
      label: 'Actividad Infrecuente',
    },
    inactive: {
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      icon: <XCircle className="h-4 w-4" />,
      label: 'Actividad Baja / Inactivo',
    },
  };

  const config = statusConfig[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <li className={`flex items-center justify-between p-3 rounded-md ${config.bgColor} hover:shadow-md transition-shadow`}>
            <span className="text-sm font-medium text-gray-700">{customer.name}</span>
            <div className={`flex items-center ${config.color}`}>
              {config.icon}
            </div>
          </li>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
          {customer.lastVisit && <p className="text-xs">Última visita: {differenceInDays(new Date(), parseISO(customer.lastVisit))} días</p>}
          {!customer.lastVisit && <p className="text-xs">Sin visitas registradas</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CustomerActivityWidget = () => {
  const { customers, sales } = useData();

  const customersWithActivity = useMemo(() => {
    if (!customers || !sales) return [];
    
    return customers.map(customer => {
      const customerSales = sales.filter(sale => sale.customerId === customer.id);
      let lastActivityDate = customer.lastVisit; // Prioritize lastVisit from customer record if available

      if (customerSales.length > 0) {
        const lastSaleDate = customerSales.reduce((latest, sale) => 
          new Date(sale.date) > new Date(latest) ? sale.date : latest, 
        customerSales[0].date);
        
        if (!lastActivityDate || new Date(lastSaleDate) > new Date(lastActivityDate)) {
          lastActivityDate = lastSaleDate;
        }
      }
      
      const status = getCustomerActivityStatus(lastActivityDate);
      return { ...customer, status, lastActivityDate };
    }).sort((a, b) => {
      // Sort by status: regular, infrequent, inactive
      const statusOrder = { regular: 0, infrequent: 1, inactive: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      // Then by last activity date (most recent first)
      if (a.lastActivityDate && b.lastActivityDate) {
        return new Date(b.lastActivityDate) - new Date(a.lastActivityDate);
      }
      return a.lastActivityDate ? -1 : 1; // Customers with activity date first
    });
  }, [customers, sales]);

  if (!customers || customers.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="mr-3 text-purple-600 h-6 w-6" />
            Actividad de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No hay datos de clientes para mostrar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Users className="mr-3 text-purple-600 h-6 w-6" />
          Actividad de Clientes (Últimos 30 días)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customersWithActivity.length > 0 ? (
          <ul className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
            {customersWithActivity.map(customer => (
              <CustomerActivityItem key={customer.id} customer={customer} status={customer.status} />
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay actividad de clientes para mostrar en el período seleccionado.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerActivityWidget;
