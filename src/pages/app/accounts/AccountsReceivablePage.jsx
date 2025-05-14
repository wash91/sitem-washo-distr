
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Search, Filter, User, CalendarDays, Coins as HandCoins, Edit, List, LayoutGrid, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

const PaymentForm = ({ receivable, onSubmit, onCancel }) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const { toast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ variant: "destructive", title: "Monto inválido", description: "Ingrese un monto de pago válido." });
            return;
        }
        if (amount > receivable.remainingAmount) {
            toast({ variant: "destructive", title: "Monto excede deuda", description: `El pago no puede ser mayor a ${receivable.remainingAmount.toFixed(2)}.` });
            return;
        }
        onSubmit(receivable.id, amount, paymentMethod);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <p>Deuda Actual: <span className="font-semibold">${receivable.remainingAmount.toFixed(2)}</span></p>
            <div>
                <Label htmlFor="paymentAmount">Monto del Abono</Label>
                <Input 
                    id="paymentAmount" 
                    type="number" 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)} 
                    step="0.01" 
                    min="0.01"
                    max={receivable.remainingAmount.toFixed(2)}
                    required 
                />
            </div>
            <div>
                <Label htmlFor="paymentMethod">Forma de Pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Registrar Abono</Button>
            </DialogFooter>
        </form>
    );
};

const ReceivableCard = ({ receivable, onOpenPaymentModal, isAdmin, getStatusColor, statusTranslations }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-blue-700">{receivable.customerName}</CardTitle>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(receivable.status)}`}>
                    {statusTranslations[receivable.status] || receivable.status}
                </span>
            </div>
            <CardDescription className="text-xs">
                {format(parseISO(receivable.date), 'dd/MM/yyyy')}
                {isAdmin && ` - ${receivable.distributorName || 'N/A'}`}
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-1 text-sm">
            <p>Monto Original: <span className="font-semibold">${receivable.originalAmount.toFixed(2)}</span></p>
            <p>Monto Pagado: <span className="font-semibold text-green-600">${receivable.paidAmount.toFixed(2)}</span></p>
            <p>Saldo Pendiente: <span className="font-semibold text-red-600">${receivable.remainingAmount.toFixed(2)}</span></p>
            <p className="text-xs text-gray-500">ID Venta: {receivable.saleId}</p>
        </CardContent>
        <CardFooter className="pt-4 border-t mt-auto">
            {receivable.status !== 'paid' && (
                <Button variant="outline" size="sm" onClick={() => onOpenPaymentModal(receivable)} className="w-full text-green-600 border-green-500 hover:bg-green-50">
                    <DollarSign className="mr-1 h-4 w-4" /> Registrar Abono
                </Button>
            )}
        </CardFooter>
    </Card>
);


const AccountsReceivablePage = () => {
    const { accountsReceivable, addPaymentToReceivable, customers, distributors, isDataLoaded, reloadAllData } = useData();
    const { user, ROLES } = useAuth();
    const { toast } = useToast();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedReceivable, setSelectedReceivable] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCustomer, setFilterCustomer] = useState('all');
    const [filterDistributor, setFilterDistributor] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'

    const isAdmin = user?.role === ROLES.ADMIN;

    useEffect(() => {
        if (isDataLoaded) {
          reloadAllData(); 
        }
    }, [isDataLoaded, reloadAllData]);

    const handlePaymentSubmit = (receivableId, amount, method) => {
        addPaymentToReceivable(receivableId, amount, method);
        setIsPaymentModalOpen(false);
        setSelectedReceivable(null);
    };

    const openPaymentModal = (receivable) => {
        setSelectedReceivable(receivable);
        setIsPaymentModalOpen(true);
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-red-100 text-red-800';
            case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const statusTranslations = {
        pending: 'Pendiente',
        partially_paid: 'Parcialmente Pagado',
        paid: 'Pagado',
    };

    const filteredReceivables = useMemo(() => {
        if (!isDataLoaded) return [];
        return accountsReceivable
            .filter(ar => {
                const searchMatch = searchTerm === '' ||
                    ar.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ar.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ar.saleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ar.distributorName?.toLowerCase().includes(searchTerm.toLowerCase());
                const statusMatch = filterStatus === 'all' || ar.status === filterStatus;
                const customerMatch = filterCustomer === 'all' || ar.customerId === filterCustomer;
                
                let distributorMatch = true;
                if (isAdmin && filterDistributor !== 'all') {
                    distributorMatch = ar.distributorId === filterDistributor;
                } else if (!isAdmin) {
                    distributorMatch = ar.distributorId === user?.id;
                }
                
                return searchMatch && statusMatch && customerMatch && distributorMatch;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [accountsReceivable, searchTerm, filterStatus, filterCustomer, filterDistributor, user, isAdmin, distributors, isDataLoaded]);

    if (!isDataLoaded) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Cargando cuentas por cobrar...</p>
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
                <h1 className="text-3xl font-bold text-gray-800 flex items-center"><HandCoins className="mr-3 text-orange-500 h-8 w-8"/>Cuentas por Cobrar</h1>
                <div>
                    <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'card' : 'list')} className="mr-2">
                        {viewMode === 'list' ? <LayoutGrid className="mr-2 h-4 w-4" /> : <List className="mr-2 h-4 w-4" />}
                        {viewMode === 'list' ? 'Vista Tarjetas' : 'Vista Lista'}
                    </Button>
                </div>
            </div>

            {selectedReceivable && (
                <Dialog open={isPaymentModalOpen} onOpenChange={(isOpen) => {
                    setIsPaymentModalOpen(isOpen);
                    if (!isOpen) setSelectedReceivable(null);
                }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Registrar Abono</DialogTitle>
                            <DialogDescription>Abono para la cuenta de {selectedReceivable.customerName}.</DialogDescription>
                        </DialogHeader>
                        <PaymentForm
                            receivable={selectedReceivable}
                            onSubmit={handlePaymentSubmit}
                            onCancel={() => { setIsPaymentModalOpen(false); setSelectedReceivable(null); }}
                        />
                    </DialogContent>
                </Dialog>
            )}

            <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Buscar por cliente, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger><Filter className="mr-2 h-4 w-4 text-gray-500 inline-block"/> <SelectValue placeholder="Estado" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            {Object.entries(statusTranslations).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                        <SelectTrigger><User className="mr-2 h-4 w-4 text-gray-500 inline-block"/> <SelectValue placeholder="Cliente" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Clientes</SelectItem>
                            {customers.map(cust => (
                                <SelectItem key={cust.id} value={cust.id}>{cust.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isAdmin && (
                        <Select value={filterDistributor} onValueChange={setFilterDistributor}>
                            <SelectTrigger><User className="mr-2 h-4 w-4 text-gray-500 inline-block"/> <SelectValue placeholder="Distribuidor" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Distribuidores</SelectItem>
                                {distributors.map(dist => (
                                    <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuidor</th>}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Original</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Pagado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Pendiente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReceivables.map(ar => (
                                <tr key={ar.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(parseISO(ar.date), 'dd/MM/yyyy')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ar.customerName}</td>
                                    {isAdmin && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ar.distributorName}</td>}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${ar.originalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${ar.paidAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">${ar.remainingAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ar.status)}`}>
                                            {statusTranslations[ar.status] || ar.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {ar.status !== 'paid' && (
                                            <Button variant="outline" size="sm" onClick={() => openPaymentModal(ar)} className="text-green-600 border-green-500 hover:bg-green-50">
                                                <DollarSign className="mr-1 h-4 w-4" /> Registrar Abono
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredReceivables.length === 0 && (
                        <p className="text-center py-10 text-gray-500">No hay cuentas por cobrar que coincidan con los filtros.</p>
                    )}
                </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredReceivables.map(ar => (
                        <ReceivableCard 
                            key={ar.id} 
                            receivable={ar} 
                            onOpenPaymentModal={openPaymentModal}
                            isAdmin={isAdmin}
                            getStatusColor={getStatusColor}
                            statusTranslations={statusTranslations}
                        />
                    ))}
                     {filteredReceivables.length === 0 && (
                        <p className="col-span-full text-center py-10 text-gray-500">No hay cuentas por cobrar que coincidan con los filtros.</p>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default AccountsReceivablePage;
