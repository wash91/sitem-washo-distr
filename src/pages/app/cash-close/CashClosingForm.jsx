
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from "@/components/ui/use-toast";
import DenominationCounter from './DenominationCounter';

const CashClosingForm = ({ onSubmit, onCancel, initialData, userCashOpenings, sales, expenses, accountsReceivable, isAdmin, distributors }) => {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const sigCanvas = useRef({});
    
    const getDefaultState = () => ({
        openingId: '',
        distributorId: isAdmin ? '' : currentUser?.id,
        distributorName: isAdmin ? '' : currentUser?.name,
        totalSales: 0,
        cashCounted: 0, 
        totalExpenses: 0,
        totalPaymentsReceived: 0,
        difference: 0,
        signature: '',
        comments: '',
        denominationQuantities: {}, 
        date: new Date().toISOString(),
    });

    const [closingData, setClosingData] = useState(initialData ? 
        {
            ...getDefaultState(),
            ...initialData, 
            cashCounted: parseFloat(initialData.cashCounted) || 0, 
            totalPaymentsReceived: parseFloat(initialData.totalPaymentsReceived) || 0,
            denominationQuantities: initialData.denominationQuantities || {}
        } 
        : getDefaultState()
    );

    useEffect(() => {
        if (initialData) {
            setClosingData({
                ...getDefaultState(),
                ...initialData, 
                cashCounted: parseFloat(initialData.cashCounted) || 0, 
                totalPaymentsReceived: parseFloat(initialData.totalPaymentsReceived) || 0,
                denominationQuantities: initialData.denominationQuantities || {}
            });
            if(initialData.signature && sigCanvas.current && typeof sigCanvas.current.fromDataURL === 'function') {
                sigCanvas.current.fromDataURL(initialData.signature);
            }
        } else {
            const defaultStateForNew = getDefaultState();
            if (isAdmin) {
                 setClosingData(prev => ({ ...defaultStateForNew, distributorId: prev.distributorId, distributorName: prev.distributorName }));
            } else {
                 setClosingData(defaultStateForNew);
            }
        }
    }, [initialData, isAdmin, currentUser]);

    const selectedOpening = useMemo(() => {
        return userCashOpenings.find(op => op.id === closingData.openingId && !op.isClosed);
    }, [closingData.openingId, userCashOpenings]);

    useEffect(() => {
        if (selectedOpening) {
            const openingDate = format(new Date(selectedOpening.date), 'yyyy-MM-dd');
            const distributorSales = sales.filter(
                s => s.distributorId === selectedOpening.distributorId && 
                     format(new Date(s.date), 'yyyy-MM-dd') >= openingDate &&
                     s.paymentMethod === 'efectivo' &&
                     (!s.closingId || s.closingId === closingData.id) 
            );
            const distributorExpenses = expenses.filter(
                e => e.distributorId === selectedOpening.distributorId && 
                     format(new Date(e.date), 'yyyy-MM-dd') >= openingDate &&
                     e.paymentMethod === 'efectivo' &&
                     (!e.closingId || e.closingId === closingData.id)
            );
            const distributorPayments = accountsReceivable
                .flatMap(ar => ar.payments || [])
                .filter(p => 
                    p.distributorId === selectedOpening.distributorId && 
                    format(new Date(p.date), 'yyyy-MM-dd') >= openingDate &&
                    p.method === 'efectivo' &&
                    (!p.closingId || p.closingId === closingData.id)
                );

            const totalSalesAmount = distributorSales.reduce((sum, s) => sum + s.amountPaid, 0);
            const totalExpensesAmount = distributorExpenses.reduce((sum, e) => sum + e.amount, 0);
            const totalPaymentsReceivedAmount = distributorPayments.reduce((sum, p) => sum + p.amount, 0);

            setClosingData(prev => ({
                ...prev,
                totalSales: totalSalesAmount,
                totalExpenses: totalExpensesAmount,
                totalPaymentsReceived: totalPaymentsReceivedAmount,
            }));
        } else if (!initialData) { 
             setClosingData(prev => ({ ...prev, totalSales: 0, totalExpenses: 0, totalPaymentsReceived: 0 }));
        }
    }, [selectedOpening, sales, expenses, accountsReceivable, initialData, closingData.id]);

    useEffect(() => {
        const cashCountedNum = parseFloat(closingData.cashCounted) || 0;
        const cashInBase = parseFloat(selectedOpening?.cashAmount) || 0;
        const expectedCash = cashInBase + closingData.totalSales + closingData.totalPaymentsReceived - closingData.totalExpenses;
        const difference = cashCountedNum - expectedCash;
        setClosingData(prev => ({ ...prev, difference }));
    }, [closingData.totalSales, closingData.cashCounted, closingData.totalExpenses, closingData.totalPaymentsReceived, selectedOpening]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setClosingData(prev => ({ ...prev, [name]: value }));
    };

    const handleDenominationCountsChange = (quantities, totalCounted) => {
        setClosingData(prev => ({
            ...prev,
            denominationQuantities: quantities,
            cashCounted: totalCounted
        }));
    };

    const handleDistributorChangeForForm = (distributorId) => {
        const selectedDistributor = distributors.find(d => d.id === distributorId);
        setClosingData(prev => ({ 
            ...getDefaultState(), 
            distributorId: selectedDistributor?.id || '',
            distributorName: selectedDistributor?.name || '',
        }));
    };
    
    const clearSignature = () => sigCanvas.current.clear();
    
    const saveSignature = () => {
        if (sigCanvas.current.isEmpty()) {
            toast({ variant: "destructive", title: "Error", description: "Por favor firme el cierre de caja." });
            return false;
        }
        setClosingData(prev => ({ ...prev, signature: sigCanvas.current.toDataURL('image/png') }));
        return true;
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (!closingData.openingId) {
            toast({ variant: "destructive", title: "Error", description: "Por favor seleccione una apertura de caja activa." });
            return;
        }
        if (!saveSignature()) return;

        if (closingData.cashCounted === '' || isNaN(parseFloat(closingData.cashCounted))) {
            toast({ variant: "destructive", title: "Error", description: "El total de efectivo contado no es válido. Verifique el desglose." });
            return;
        }
        onSubmit({...closingData, cashCounted: parseFloat(closingData.cashCounted), totalPaymentsReceived: parseFloat(closingData.totalPaymentsReceived) || 0});
    };

    const availableOpenings = isAdmin ? 
        (closingData.distributorId ? userCashOpenings.filter(op => op.distributorId === closingData.distributorId && !op.isClosed) : [])
        : userCashOpenings.filter(op => op.distributorId === currentUser?.id && !op.isClosed);

    return (
        <form onSubmit={handleSubmitForm} className="space-y-3 py-2 max-h-[85vh] overflow-y-auto p-1 custom-scrollbar">
            <div>
                <Label htmlFor="closingDate">Fecha Cierre</Label>
                <Input id="closingDate" type="text" value={format(new Date(closingData.date || Date.now()), 'dd/MM/yyyy HH:mm')} disabled />
            </div>
            
            {isAdmin && (
                <div>
                    <Label htmlFor="distributorIdForm">Distribuidor</Label>
                    <Select name="distributorIdForm" value={closingData.distributorId} onValueChange={handleDistributorChangeForForm} disabled={!!initialData}>
                        <SelectTrigger id="distributorIdForm"><SelectValue placeholder="Seleccione un distribuidor" /></SelectTrigger>
                        <SelectContent>
                        {distributors.map(dist => (
                            <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div>
                <Label htmlFor="openingId">Apertura de Caja a Cerrar</Label>
                <Select name="openingId" value={closingData.openingId} onValueChange={(value) => setClosingData(prev => ({...prev, openingId: value}))} disabled={!closingData.distributorId || !!initialData}>
                    <SelectTrigger id="openingId"><SelectValue placeholder="Seleccione una apertura activa" /></SelectTrigger>
                    <SelectContent>
                        {availableOpenings.map(op => (
                            <SelectItem key={op.id} value={op.id}>
                                Apertura del {format(new Date(op.date), 'dd/MM/yyyy HH:mm')} (Base: ${op.cashAmount.toFixed(2)})
                            </SelectItem>
                        ))}
                         {availableOpenings.length === 0 && <p className="p-2 text-sm text-gray-500">No hay aperturas activas para este distribuidor.</p>}
                    </SelectContent>
                </Select>
            </div>
            
            <div>
                <Label htmlFor="cashInBase">Efectivo Base (de Apertura)</Label>
                <Input id="cashInBase" type="text" value={`${(selectedOpening?.cashAmount || 0).toFixed(2)}`} disabled />
            </div>
            <div>
                <Label htmlFor="totalSales">Total Ventas Efectivo (Calculado)</Label>
                <Input id="totalSales" type="text" value={`${closingData.totalSales.toFixed(2)}`} disabled />
            </div>
            <div>
                <Label htmlFor="totalPaymentsReceived">Total Abonos Recibidos Efectivo (Calculado)</Label>
                <Input id="totalPaymentsReceived" type="text" value={`${closingData.totalPaymentsReceived.toFixed(2)}`} disabled />
            </div>
            <div>
                <Label htmlFor="totalExpenses">Total Gastos Efectivo (Calculado)</Label>
                <Input id="totalExpenses" type="text" value={`${closingData.totalExpenses.toFixed(2)}`} disabled />
            </div>
            
            <DenominationCounter 
                initialQuantities={closingData.denominationQuantities}
                onQuantitiesChange={handleDenominationCountsChange}
            />

            <div>
                <Label htmlFor="cashCountedDisplay">Total Efectivo Contado (Calculado del Desglose)</Label>
                <Input id="cashCountedDisplay" name="cashCountedDisplay" type="text" value={closingData.cashCounted.toFixed(2)} disabled className="font-bold text-lg" />
            </div>

            <div>
                <Label htmlFor="differenceDisplay">Diferencia (Contado vs. Esperado)</Label>
                <Input id="differenceDisplay" type="text" value={`${closingData.difference.toFixed(2)}`} disabled 
                       className={closingData.difference < 0 ? "text-red-600 font-bold" : closingData.difference > 0 ? "text-yellow-600 font-bold" : "text-green-600 font-bold"} />
                {closingData.difference !== 0 && <p className="text-xs text-gray-500 mt-1">{closingData.difference < 0 ? "Faltante" : "Sobrante"}</p>}
            </div>
            <div>
                <Label htmlFor="comments">Comentarios</Label>
                <textarea id="comments" name="comments" value={closingData.comments} onChange={handleInputChange} className="w-full p-2 border rounded-md text-sm" rows="2"></textarea>
            </div>
            <div>
                <Label>Firma Digital</Label>
                <div className="border rounded-md bg-white">
                    <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{className: 'w-full h-32'}} />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={clearSignature} className="mt-1">Limpiar Firma</Button>
            </div>
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{initialData ? 'Actualizar' : 'Guardar'} Cierre</Button>
            </DialogFooter>
        </form>
    );
};

export default CashClosingForm;
