
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Calendar, Filter, RefreshCw, UserCheck, UserX, UserMinus, AlertTriangle, Users, Package, TrendingUp, Award, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from '@/context/DataContext';
import { format, subDays, parseISO } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

const ReportCard = ({ title, icon, children, className }) => (
    <Card className={`shadow-lg ${className || ''}`}>
        <CardHeader>
            <CardTitle className="flex items-center text-xl">
                {icon && React.cloneElement(icon, { className: "mr-3 h-6 w-6" })}
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

const ReportsPage = () => {
  const { sales, refills, expenses, customers, products, distributors } = useData();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedDistributorForFilter, setSelectedDistributorForFilter] = useState('all');

  const handleDateChange = (e) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredSales = useMemo(() => {
    const fromDate = dateRange.from ? parseISO(dateRange.from) : null;
    const toDate = dateRange.to ? parseISO(dateRange.to) : null;

    return sales.filter(sale => {
      const saleDate = parseISO(sale.date);
      const dateCondition = (!fromDate || saleDate >= fromDate) && (!toDate || saleDate <= toDate);
      const distributorCondition = selectedDistributorForFilter === 'all' || sale.distributorId === selectedDistributorForFilter;
      return dateCondition && distributorCondition;
    });
  }, [sales, dateRange, selectedDistributorForFilter]);

  const filteredRefills = useMemo(() => {
    const fromDate = dateRange.from ? parseISO(dateRange.from) : null;
    const toDate = dateRange.to ? parseISO(dateRange.to) : null;
     return refills.filter(refill => {
        const refillDate = parseISO(refill.date);
        const dateCondition = (!fromDate || refillDate >= fromDate) && (!toDate || refillDate <= toDate);
        return dateCondition;
    });
  }, [refills, dateRange]);

  const filteredExpenses = useMemo(() => {
    const fromDate = dateRange.from ? parseISO(dateRange.from) : null;
    const toDate = dateRange.to ? parseISO(dateRange.to) : null;
    return expenses.filter(expense => {
        const expenseDate = parseISO(expense.date);
        const dateCondition = (!fromDate || expenseDate >= fromDate) && (!toDate || expenseDate <= toDate);
        const distributorCondition = selectedDistributorForFilter === 'all' || expense.distributorId === selectedDistributorForFilter;
        return dateCondition && distributorCondition;
    });
  }, [expenses, dateRange, selectedDistributorForFilter]);


  const summaryMetrics = useMemo(() => {
    const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalRefillsCost = filteredRefills.reduce((sum, refill) => sum + (refill.totalCost || 0), 0);
    const totalExpensesAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalSalesAmount - totalRefillsCost - totalExpensesAmount;
    return { totalSalesAmount, totalRefillsCost, totalExpensesAmount, profit };
  }, [filteredSales, filteredRefills, filteredExpenses]);

  const salesByDistributor = useMemo(() => {
    const salesMap = new Map();
    filteredSales.forEach(sale => {
      const distributorName = sale.distributorName || 'Desconocido';
      salesMap.set(distributorName, (salesMap.get(distributorName) || 0) + sale.total);
    });
    return Array.from(salesMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const topProductsByQuantity = useMemo(() => {
    const productMap = new Map();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const productName = item.productName || products.find(p => p.id === item.productId)?.name || 'Desconocido';
        productMap.set(productName, (productMap.get(productName) || 0) + item.quantity);
      });
    });
    return Array.from(productMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredSales, products]);

  const topProductsByRevenue = useMemo(() => {
    const productMap = new Map();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const productName = item.productName || products.find(p => p.id === item.productId)?.name || 'Desconocido';
        const revenue = item.quantity * item.price;
        productMap.set(productName, (productMap.get(productName) || 0) + revenue);
      });
    });
    return Array.from(productMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales, products]);
  
  const topCustomers = useMemo(() => {
    const customerMap = new Map();
    filteredSales.forEach(sale => {
      customerMap.set(sale.customerName, (customerMap.get(sale.customerName) || 0) + sale.total);
    });
    return Array.from(customerMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredSales]);

  const productProfitability = useMemo(() => {
    const profitabilityMap = new Map();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const profitPerUnit = item.price - (product.purchasePrice || 0);
          const totalProfitForItem = profitPerUnit * item.quantity;
          const current = profitabilityMap.get(product.name) || { totalRevenue: 0, totalProfit: 0, quantitySold: 0 };
          profitabilityMap.set(product.name, {
            totalRevenue: current.totalRevenue + (item.price * item.quantity),
            totalProfit: current.totalProfit + totalProfitForItem,
            quantitySold: current.quantitySold + item.quantity
          });
        }
      });
    });
    return Array.from(profitabilityMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalProfit - a.totalProfit);
  }, [filteredSales, products]);

  const handleExport = (type) => {
    toast({
      title: `Exportación ${type} solicitada`,
      description: `La funcionalidad de exportación a ${type} está en desarrollo. Por ahora, esto es una simulación.`,
    });
    console.log(`Exporting data as ${type}...`, { summaryMetrics, filteredSales, salesByDistributor, topProductsByQuantity, topProductsByRevenue, topCustomers, productProfitability });
  };

  const ReportListItem = ({ label, value, currency = false, unit = '' }) => (
    <li className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-800">
            {currency && '$'}{value.toLocaleString(undefined, { minimumFractionDigits: currency ? 2 : 0, maximumFractionDigits: 2 })} {unit}
        </span>
    </li>
  );


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center"><BarChart3 className="mr-3 h-8 w-8 text-indigo-600" />Reportes y Métricas</h1>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button onClick={() => handleExport('PDF')} variant="outline" className="bg-red-500 hover:bg-red-600 text-white"><Download className="mr-2 h-4 w-4" /> PDF</Button>
            <Button onClick={() => handleExport('Excel')} variant="outline" className="bg-green-500 hover:bg-green-600 text-white"><Download className="mr-2 h-4 w-4" /> Excel</Button>
        </div>
      </div>

      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-indigo-500" /> Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dateFrom">Fecha Desde</Label>
            <Input type="date" id="dateFrom" name="from" value={dateRange.from} onChange={handleDateChange} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"/>
          </div>
          <div>
            <Label htmlFor="dateTo">Fecha Hasta</Label>
            <Input type="date" id="dateTo" name="to" value={dateRange.to} onChange={handleDateChange} className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"/>
          </div>
          <div>
            <Label htmlFor="distributorFilter">Distribuidor</Label>
             <Select value={selectedDistributorForFilter} onValueChange={setSelectedDistributorForFilter}>
                <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"><SelectValue placeholder="Todos los distribuidores" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los distribuidores</SelectItem>
                    {distributors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <ReportCard title="Resumen Financiero General" icon={<TrendingUp className="text-green-500"/>} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-black/20 p-4 rounded-lg">
              <p className="text-sm uppercase text-blue-200">Ventas Totales</p>
              <p className="text-3xl font-bold">${summaryMetrics.totalSalesAmount.toFixed(2)}</p>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <p className="text-sm uppercase text-blue-200">Costo Mercadería (Recargas)</p>
              <p className="text-3xl font-bold">${summaryMetrics.totalRefillsCost.toFixed(2)}</p>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <p className="text-sm uppercase text-blue-200">Gastos Totales</p>
              <p className="text-3xl font-bold">${summaryMetrics.totalExpensesAmount.toFixed(2)}</p>
            </div>
            <div className={`bg-black/20 p-4 rounded-lg ${summaryMetrics.profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              <p className="text-sm uppercase">{summaryMetrics.profit >=0 ? 'Utilidad Bruta Estimada' : 'Pérdida Estimada'}</p>
              <p className="text-3xl font-bold">${Math.abs(summaryMetrics.profit).toFixed(2)}</p>
            </div>
          </div>
      </ReportCard>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReportCard title="Ranking de Ventas por Distribuidor" icon={<Users className="text-purple-500"/>}>
          {salesByDistributor.length > 0 ? (
            <ul className="space-y-1">
              {salesByDistributor.map((item, index) => (
                <ReportListItem key={index} label={`${index + 1}. ${item.name}`} value={item.total} currency />
              ))}
            </ul>
          ) : <p className="text-gray-500 text-center py-4">No hay datos de ventas para mostrar ranking.</p>}
        </ReportCard>

        <ReportCard title="Top 10 Clientes (por Monto Comprado)" icon={<Award className="text-yellow-500"/>}>
          {topCustomers.length > 0 ? (
            <ul className="space-y-1">
              {topCustomers.map((item, index) => (
                <ReportListItem key={index} label={`${index + 1}. ${item.name}`} value={item.total} currency />
              ))}
            </ul>
          ) : <p className="text-gray-500 text-center py-4">No hay datos de clientes para mostrar ranking.</p>}
        </ReportCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReportCard title="Productos Más Vendidos (Top 10 por Cantidad)" icon={<Package className="text-teal-500"/>}>
          {topProductsByQuantity.length > 0 ? (
            <ul className="space-y-1">
              {topProductsByQuantity.map((item, index) => (
                <ReportListItem key={index} label={`${index + 1}. ${item.name}`} value={item.quantity} unit="unidades"/>
              ))}
            </ul>
          ) : <p className="text-gray-500 text-center py-4">No hay datos de productos para mostrar ranking.</p>}
        </ReportCard>

        <ReportCard title="Productos Más Vendidos (Top 10 por Ingresos)" icon={<ShoppingCart className="text-orange-500"/>}>
           {topProductsByRevenue.length > 0 ? (
            <ul className="space-y-1">
              {topProductsByRevenue.map((item, index) => (
                <ReportListItem key={index} label={`${index + 1}. ${item.name}`} value={item.revenue} currency />
              ))}
            </ul>
          ) : <p className="text-gray-500 text-center py-4">No hay datos de productos para mostrar ranking.</p>}
        </ReportCard>
      </div>

      <ReportCard title="Rentabilidad por Producto" icon={<TrendingUp className="text-lime-500"/>}>
        {productProfitability.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cant. Vendida</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos Totales</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilidad Total Estimada</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productProfitability.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">{item.quantitySold.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">${item.totalRevenue.toFixed(2)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold text-right ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${item.totalProfit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-500 text-center py-4">No hay datos de ventas o productos para calcular rentabilidad.</p>}
      </ReportCard>

    </motion.div>
  );
};

export default ReportsPage;
