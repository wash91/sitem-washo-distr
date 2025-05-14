
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";


const ExpenseForm = ({ onSubmit, onCancel, initialData, expenseCategories, isAdmin, distributors }) => {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    
    const getDefaultState = () => ({
        distributorId: isAdmin ? '' : currentUser?.id,
        distributorName: isAdmin ? '' : currentUser?.name,
        category: expenseCategories?.[0]?.name || '',
        amount: '',
        paymentMethod: 'efectivo',
        observations: '',
        date: new Date().toISOString()
    });
    
    const [expenseData, setExpenseData] = useState(initialData ? {...initialData, amount: initialData.amount.toString() } : getDefaultState());

    useEffect(() => {
        if (initialData) {
            setExpenseData({...initialData, amount: initialData.amount.toString()});
        } else {
            setExpenseData(getDefaultState());
        }
    }, [initialData, expenseCategories, isAdmin, currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExpenseData(prev => ({ ...prev, [name]: value }));
    };

    const handleDistributorChangeForForm = (distributorId) => {
        const selectedDistributor = distributors.find(d => d.id === distributorId);
        setExpenseData(prev => ({ 
            ...prev, 
            distributorId: selectedDistributor?.id || '',
            distributorName: selectedDistributor?.name || '',
        }));
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (isAdmin && !expenseData.distributorId) {
            toast({ variant: "destructive", title: "Error", description: "Por favor seleccione un distribuidor." });
            return;
        }
        if (!expenseData.category || !expenseData.amount || parseFloat(expenseData.amount) <= 0) {
            toast({ variant: "destructive", title: "Error", description: "Por favor complete la categoría y un monto válido."});
            return;
        }
        onSubmit({...expenseData, amount: parseFloat(expenseData.amount)});
    };

    return (
        <form onSubmit={handleSubmitForm} className="space-y-4 py-4">
            <div>
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="text" value={format(new Date(expenseData.date || Date.now()), 'dd/MM/yyyy HH:mm')} disabled />
            </div>
             {isAdmin && (
                <div>
                    <Label htmlFor="distributorIdExpense">Distribuidor</Label>
                    <Select name="distributorIdExpense" value={expenseData.distributorId} onValueChange={handleDistributorChangeForForm} disabled={!!initialData && !isAdmin}>
                        <SelectTrigger><SelectValue placeholder="Seleccione un distribuidor" /></SelectTrigger>
                        <SelectContent>
                        {distributors.map(dist => (
                            <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {!isAdmin && <div><Label htmlFor="distributorName">Distribuidor</Label><Input id="distributorName" type="text" value={expenseData.distributorName || currentUser?.name} disabled /></div>}

            <div>
                <Label htmlFor="category">Categoría del Gasto</Label>
                <Select name="category" value={expenseData.category} onValueChange={(value) => setExpenseData(prev => ({...prev, category: value}))}>
                    <SelectTrigger><SelectValue placeholder="Seleccione una categoría" /></SelectTrigger>
                    <SelectContent>
                        {expenseCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name} className="capitalize">{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" name="amount" type="number" value={expenseData.amount} onChange={handleInputChange} step="0.01" min="0.01" required/>
            </div>
            <div>
                <Label htmlFor="paymentMethod">Forma de Pago</Label>
                <Select name="paymentMethod" value={expenseData.paymentMethod} onValueChange={(value) => setExpenseData(prev => ({...prev, paymentMethod: value}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="observations">Observaciones</Label>
                <textarea id="observations" name="observations" value={expenseData.observations} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows="3"></textarea>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">{initialData ? 'Actualizar' : 'Guardar'} Gasto</Button>
            </DialogFooter>
        </form>
    );
};

export default ExpenseForm;
