
import React, { useState, useMemo } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";

const CustomerSearchComponent = React.memo(({ customerSearchTerm, onSearchChange, onCustomerSelect, onNavigateToCreate, customers, orderToProcess, currentCustomerId }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredCustomers = useMemo(() => {
        if (!customerSearchTerm) return [];
        const lowerSearchTerm = customerSearchTerm.toLowerCase();
        return customers.filter(customer =>
            customer.ciRuc?.toLowerCase().startsWith(lowerSearchTerm) || 
            customer.name.toLowerCase().includes(lowerSearchTerm)
        ).slice(0, 5); 
    }, [customers, customerSearchTerm]);

    return (
        <div className="relative">
            <Label htmlFor="customerSearch">Buscar Cliente (CI/RUC o Nombre)</Label>
            <div className="flex items-center mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                    id="customerSearch"
                    type="text" 
                    value={customerSearchTerm} 
                    onChange={onSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
                    placeholder="Escriba CI/RUC o nombre..."
                    className="pl-10"
                    disabled={!!orderToProcess}
                    autoComplete="off"
                />
            </div>
            {showSuggestions && !orderToProcess && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                            <div 
                                key={customer.id} 
                                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onMouseDown={() => { onCustomerSelect(customer); setShowSuggestions(false); }}
                            >
                                {customer.name} ({customer.ciRuc || 'N/A'})
                            </div>
                        ))
                    ) : (
                        customerSearchTerm && <p className="p-2 text-sm text-gray-500">No se encontraron clientes.</p>
                    )}
                    {customerSearchTerm && !currentCustomerId && (
                         <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full mt-1 text-blue-600 border-blue-500 hover:bg-blue-50 text-sm"
                            onMouseDown={onNavigateToCreate} 
                        >
                            <UserPlus className="mr-2 h-4 w-4" /> Crear Nuevo: "{customerSearchTerm}"
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
});

export default CustomerSearchComponent;
