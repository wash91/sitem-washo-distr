
import React, { useMemo } from 'react';
import { DollarSign, ShoppingCart, CalendarCheck2 } from 'lucide-react';
import { StatCard } from '@/pages/app/dashboard/StatCard';

const DashboardStats = React.memo(({ currentPeriodData, previousPeriodData, calculateTrend, trendPeriodLabel }) => {
    const totalVendido = useMemo(() => currentPeriodData.sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0), [currentPeriodData.sales]);
    const prevTotalVendido = useMemo(() => previousPeriodData.sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0), [previousPeriodData.sales]);
    const ventasTrend = useMemo(() => calculateTrend(totalVendido, prevTotalVendido), [totalVendido, prevTotalVendido, calculateTrend]);
    
    const totalGastos = useMemo(() => currentPeriodData.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0), [currentPeriodData.expenses]);
    const prevTotalGastos = useMemo(() => previousPeriodData.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0), [previousPeriodData.expenses]);
    const gastosTrend = useMemo(() => calculateTrend(totalGastos, prevTotalGastos), [totalGastos, prevTotalGastos, calculateTrend]);

    const numeroVentas = useMemo(() => currentPeriodData.sales.length, [currentPeriodData.sales]);
    const prevNumeroVentas = useMemo(() => previousPeriodData.sales.length, [previousPeriodData.sales]);
    const numVentasTrend = useMemo(() => calculateTrend(numeroVentas, prevNumeroVentas), [numeroVentas, prevNumeroVentas, calculateTrend]);

    const citasPendientes = useMemo(() => currentPeriodData.appointments.filter(a => a.status === 'pending').length, [currentPeriodData.appointments]);
    const prevCitasPendientes = useMemo(() => previousPeriodData.appointments ? previousPeriodData.appointments.filter(a => a.status === 'pending').length : 0, [previousPeriodData.appointments]);
    const citasTrend = useMemo(() => calculateTrend(citasPendientes, prevCitasPendientes), [citasPendientes, prevCitasPendientes, calculateTrend]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Vendido" value={`${totalVendido.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-green-500" />} trendValue={ventasTrend} trendPeriod={trendPeriodLabel} />
            <StatCard title="Número de Ventas" value={numeroVentas} icon={<ShoppingCart className="h-5 w-5 text-blue-500" />} trendValue={numVentasTrend} trendPeriod={trendPeriodLabel} />
            <StatCard title="Total Gastos" value={`${totalGastos.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-red-500" />} trendValue={gastosTrend} trendPeriod={trendPeriodLabel} />
            <StatCard title="Citas Pendientes" value={citasPendientes} icon={<CalendarCheck2 className="h-5 w-5 text-purple-500" />} trendValue={citasTrend} trendPeriod={trendPeriodLabel}/>
        </div>
    );
});

export default DashboardStats;
