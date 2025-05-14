
import React, { useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Filter, RefreshCw } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, parseISO } from 'date-fns';

const DashboardStats = React.lazy(() => import('@/pages/app/dashboard/DashboardStats'));
const TodaysAppointmentsWidget = React.lazy(() => import('@/pages/app/dashboard/TodaysAppointmentsWidget'));
const CustomerActivityWidget = React.lazy(() => import('@/pages/app/dashboard/CustomerActivityWidget'));

const LoadingFallback = ({ message = "Cargando componente..." }) => (
    <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        <p className="text-gray-600">{message}</p>
    </div>
);


const DashboardFilterControls = React.memo(({ dateRange, setDateRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate, selectedDistributorId, setSelectedDistributorId, allDistributorsData, dateFilterOptions, onRefresh }) => (
  <Card className="shadow-md">
    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <CardTitle className="flex items-center text-lg mb-2 sm:mb-0"><Filter className="mr-2 h-5 w-5 text-blue-500" /> Filtros del Dashboard</CardTitle>
        <Button onClick={onRefresh} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4"/> Refrescar Datos
        </Button>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger><SelectValue placeholder="Seleccionar Rango" /></SelectTrigger>
        <SelectContent>
          {dateFilterOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {dateRange === 'custom' && (
        <>
          <Input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} placeholder="Fecha Inicio" className="py-2 px-3"/>
          <Input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} placeholder="Fecha Fin" className="py-2 px-3"/>
        </>
      )}
      <Select value={selectedDistributorId} onValueChange={setSelectedDistributorId}>
        <SelectTrigger><SelectValue placeholder="Seleccionar Distribuidor"/></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Distribuidores</SelectItem>
          {allDistributorsData.map(dist => (
            <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
));

const useDashboardLogic = (isDataLoaded, sales, expenses, cashClosings, appointments, reloadAllData) => {
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedDistributorId, setSelectedDistributorId] = useState('all');

  const handleRefreshData = useCallback(() => {
    reloadAllData(true, 'AdminDashboard_Refresh'); 
  }, [reloadAllData]);
  
  useEffect(() => {
    if (isDataLoaded && document.visibilityState === 'visible') {
      handleRefreshData();
    }
  }, [isDataLoaded, handleRefreshData]);

  const dateFilterOptions = useMemo(() => [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'week', label: 'Esta Semana (Lun-Dom)' },
    { value: 'last_week', label: 'Semana Pasada' },
    { value: 'month', label: 'Este Mes' },
    { value: 'last_month', label: 'Mes Pasado' },
    { value: 'custom', label: 'Personalizado' },
  ], []);

  const getPeriodDates = useCallback((period, csd, ced) => {
    const today = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'yesterday':
        const yesterday = subDays(new Date(), 1);
        startDate = new Date(yesterday.setHours(0, 0, 0, 0));
        endDate = new Date(yesterday.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case 'last_week':
        const lastWeekStart = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        startDate = lastWeekStart;
        endDate = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
      case 'last_month':
        const currentMonthStart = startOfMonth(new Date());
        const lastMonthEnd = subDays(currentMonthStart, 1);
        startDate = startOfMonth(lastMonthEnd);
        endDate = endOfMonth(lastMonthEnd);
        break;
      case 'custom':
        startDate = csd ? parseISO(csd) : null;
        if (startDate) startDate.setHours(0,0,0,0);
        endDate = ced ? parseISO(ced) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
    }
    return { startDate, endDate };
  }, []);


  const filterData = useCallback((data, period, csd, ced, distributorId, dateField = 'date') => {
    const { startDate, endDate } = getPeriodDates(period, csd, ced);
    
    if (!data) return [];
    return data.filter(item => {
      const itemDate = item[dateField] ? parseISO(item[dateField]) : null;
      if (!itemDate) return false;

      const dateMatch = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      const distributorMatch = distributorId === 'all' || item.distributorId === distributorId;
      return dateMatch && distributorMatch;
    });
  }, [getPeriodDates]);


  const currentPeriodData = useMemo(() => {
    if (!isDataLoaded) return { sales: [], expenses: [], cashClosings: [], appointments: [] };
    return {
      sales: filterData(sales, dateRange, customStartDate, customEndDate, selectedDistributorId, 'date'),
      expenses: filterData(expenses, dateRange, customStartDate, customEndDate, selectedDistributorId, 'date'),
      cashClosings: filterData(cashClosings, dateRange, customStartDate, customEndDate, selectedDistributorId, 'date'),
      appointments: filterData(appointments, dateRange, customStartDate, customEndDate, selectedDistributorId, 'appointmentDate'),
    };
  }, [sales, expenses, cashClosings, appointments, dateRange, customStartDate, customEndDate, selectedDistributorId, isDataLoaded, filterData]);

  const previousPeriod = useMemo(() => {
    if (dateRange === 'today') return 'yesterday';
    if (dateRange === 'week') return 'last_week';
    if (dateRange === 'month') return 'last_month';
    return null; 
  }, [dateRange]);

  const previousPeriodData = useMemo(() => {
    if (!isDataLoaded || !previousPeriod) return { sales: [], expenses: [], appointments: [] };
     return {
      sales: filterData(sales, previousPeriod, null, null, selectedDistributorId, 'date'), 
      expenses: filterData(expenses, previousPeriod, null, null, selectedDistributorId, 'date'),
      appointments: filterData(appointments, previousPeriod, null, null, selectedDistributorId, 'appointmentDate'),
    };
  }, [sales, expenses, appointments, previousPeriod, selectedDistributorId, isDataLoaded, filterData]);

  const calculateTrend = useCallback((currentValue, previousValue) => {
    if (previousValue === 0) return currentValue > 0 ? 100 : (currentValue < 0 ? -100 : 0);
    if (currentValue === 0 && previousValue === 0) return 0;
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  }, []);
  
  const trendPeriodLabel = useMemo(() => {
    if (dateRange === 'today') return 'vs ayer';
    if (dateRange === 'week') return 'vs semana anterior';
    if (dateRange === 'month') return 'vs mes anterior';
    return '';
  },[dateRange]);

  return {
    dateRange, setDateRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate,
    selectedDistributorId, setSelectedDistributorId, dateFilterOptions, handleRefreshData,
    currentPeriodData, previousPeriodData, calculateTrend, trendPeriodLabel
  };
};


const DashboardPage = () => {
  const { sales, expenses, cashClosings, distributors: allDistributorsData, appointments, isDataLoaded, reloadAllData, isLoading } = useData();
  
  const {
    dateRange, setDateRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate,
    selectedDistributorId, setSelectedDistributorId, dateFilterOptions, handleRefreshData,
    currentPeriodData, previousPeriodData, calculateTrend, trendPeriodLabel
  } = useDashboardLogic(isDataLoaded, sales, expenses, cashClosings, appointments, reloadAllData);
  
  if (isLoading || !isDataLoaded) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                ></motion.div>
                <p className="text-lg font-semibold text-gray-700">Cargando dashboard...</p>
            </div>
        </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Principal</h1>
      </div>

      <DashboardFilterControls
        dateRange={dateRange}
        setDateRange={setDateRange}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        selectedDistributorId={selectedDistributorId}
        setSelectedDistributorId={setSelectedDistributorId}
        allDistributorsData={allDistributorsData || []}
        dateFilterOptions={dateFilterOptions}
        onRefresh={handleRefreshData}
      />
      
      <Suspense fallback={<LoadingFallback message="Cargando estadísticas..." />}>
        <DashboardStats 
          currentPeriodData={currentPeriodData}
          previousPeriodData={previousPeriodData}
          calculateTrend={calculateTrend}
          trendPeriodLabel={trendPeriodLabel}
        />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingFallback message="Cargando citas de hoy..." />}>
          <TodaysAppointmentsWidget />
        </Suspense>
        <Suspense fallback={<LoadingFallback message="Cargando actividad de clientes..." />}>
          <CustomerActivityWidget />
        </Suspense>
      </div>
      
    </motion.div>
  );
};

export default DashboardPage;
