
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const PaymentDetailsComponent = React.memo(({ totalAmount, amountPaid, amountCredit, paymentMethod, onInputChange, onPaymentMethodChange }) => (
    <>
        <div>
            <Label className="text-lg font-bold text-blue-700">Total Venta</Label>
            <Input type="text" value={`${totalAmount.toFixed(2)}`} disabled className="text-lg font-bold text-right bg-blue-50 border-blue-200" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="amountPaid">Monto Pagado</Label>
                <Input id="amountPaid" name="amountPaid" type="number" value={amountPaid} onChange={onInputChange} step="0.01" min="0" max={totalAmount.toFixed(2)} />
            </div>
            <div>
                <Label htmlFor="amountCredit">Monto a Crédito</Label>
                <Input id="amountCredit" name="amountCredit" type="number" value={amountCredit.toFixed(2)} disabled className="bg-gray-100" />
            </div>
        </div>
        <div>
            <Label htmlFor="paymentMethod">Forma de Pago Principal</Label>
            <Select name="paymentMethod" value={paymentMethod} onValueChange={onPaymentMethodChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="credito">Crédito (Total o Parcial)</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </>
));

export default PaymentDetailsComponent;
