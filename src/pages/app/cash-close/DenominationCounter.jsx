
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DENOMINATIONS = [
  { value: 0.01, type: 'coin', label: '$0.01', id: '0.01_coin' },
  { value: 0.05, type: 'coin', label: '$0.05', id: '0.05_coin' },
  { value: 0.10, type: 'coin', label: '$0.10', id: '0.10_coin' },
  { value: 0.25, type: 'coin', label: '$0.25', id: '0.25_coin' },
  { value: 0.50, type: 'coin', label: '$0.50', id: '0.50_coin' },
  { value: 1.00, type: 'coin', label: '$1.00 (Moneda)', id: '1.00_coin' },
  { value: 1.00, type: 'bill', label: '$1.00 (Billete)', id: '1.00_bill' },
  { value: 2.00, type: 'bill', label: '$2.00', id: '2.00_bill' },
  { value: 5.00, type: 'bill', label: '$5.00', id: '5.00_bill' },
  { value: 10.00, type: 'bill', label: '$10.00', id: '10.00_bill' },
  { value: 20.00, type: 'bill', label: '$20.00', id: '20.00_bill' },
  { value: 50.00, type: 'bill', label: '$50.00', id: '50.00_bill' },
  { value: 100.00, type: 'bill', label: '$100.00', id: '100.00_bill' },
];

const DenominationCounter = ({ initialQuantities = {}, onQuantitiesChange }) => {
  const [quantities, setQuantities] = useState(initialQuantities);

  useEffect(() => {
    setQuantities(initialQuantities);
  }, [initialQuantities]);

  const handleQuantityChange = (denominationId, quantity) => {
    const newQuantities = {
      ...quantities,
      [denominationId]: parseInt(quantity, 10) || 0,
    };
    setQuantities(newQuantities);
  };

  const totals = useMemo(() => {
    let coinTotal = 0;
    let billTotal = 0;
    const denominationSubtotals = {};

    DENOMINATIONS.forEach(denom => {
      const quantity = quantities[denom.id] || 0;
      const subtotal = quantity * denom.value;
      denominationSubtotals[denom.id] = subtotal;
      if (denom.type === 'coin') {
        coinTotal += subtotal;
      } else {
        billTotal += subtotal;
      }
    });

    const grandTotal = coinTotal + billTotal;
    return { coinTotal, billTotal, grandTotal, denominationSubtotals };
  }, [quantities]);

  useEffect(() => {
    onQuantitiesChange(quantities, totals.grandTotal);
  }, [quantities, totals.grandTotal, onQuantitiesChange]);

  const renderDenominationInputs = (type) => {
    return DENOMINATIONS.filter(d => d.type === type).map(denom => (
      <div key={denom.id} className="grid grid-cols-3 items-center gap-2 mb-2">
        <Label htmlFor={denom.id} className="text-sm">{denom.label}:</Label>
        <Input
          type="number"
          id={denom.id}
          name={denom.id}
          value={quantities[denom.id] || ''}
          onChange={(e) => handleQuantityChange(denom.id, e.target.value)}
          placeholder="Cantidad"
          min="0"
          className="h-8 text-sm"
        />
        <span className="text-sm text-right font-medium">${(totals.denominationSubtotals[denom.id] || 0).toFixed(2)}</span>
      </div>
    ));
  };

  return (
    <Card className="w-full shadow-inner bg-gray-50">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-lg">Desglose de Efectivo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h4 className="font-semibold mb-2 text-base">Monedas</h4>
          {renderDenominationInputs('coin')}
          <div className="grid grid-cols-3 items-center gap-2 mt-2 pt-2 border-t">
            <span className="col-span-2 font-semibold text-right">Total Monedas:</span>
            <span className="font-bold text-right">${totals.coinTotal.toFixed(2)}</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-base">Billetes</h4>
          {renderDenominationInputs('bill')}
          <div className="grid grid-cols-3 items-center gap-2 mt-2 pt-2 border-t">
            <span className="col-span-2 font-semibold text-right">Total Billetes:</span>
            <span className="font-bold text-right">${totals.billTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="flex justify-end items-center text-lg">
            <span className="font-bold mr-2">GRAN TOTAL EFECTIVO:</span>
            <span className="font-extrabold text-indigo-600">${totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DenominationCounter;
