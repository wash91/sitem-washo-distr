
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone as PhoneIcon, MessageSquare as WhatsAppIcon, Edit, Trash2 } from 'lucide-react';

const CustomerCardView = ({ customers, onEdit, onDelete, onWhatsApp, onMap, onCall }) => {
  if (customers.length === 0) {
    return <p className="col-span-full text-center py-8 text-gray-500">No se encontraron clientes con los filtros actuales.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {customers.map(customer => (
        <Card key={customer.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-700">{customer.name}</CardTitle>
            <p className="text-xs text-gray-500 capitalize bg-blue-50 px-2 py-0.5 rounded-full inline-block">{customer.type}</p>
          </CardHeader>
          <CardContent className="flex-grow space-y-1.5 text-sm">
            <p className="flex items-center"><PhoneIcon className="inline mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />{customer.phone || 'N/A'}</p>
            <p className="flex items-center"><WhatsAppIcon className="inline mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />{customer.whatsapp || 'N/A'}</p>
            <p className="flex items-start"><MapPin className="inline mr-2 h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />{customer.address || 'N/A'}</p>
            {customer.reference && <p className="text-xs text-gray-400 pl-6">Ref: {customer.reference}</p>}
            {customer.ciRuc && <p className="text-xs text-gray-400 pl-6">CI/RUC: {customer.ciRuc}</p>}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2 border-t pt-4 mt-auto">
             <Button variant="outline" size="sm" onClick={() => onCall(customer.phone)} className="text-purple-600 border-purple-500 hover:bg-purple-50">Llamar</Button>
             <Button variant="outline" size="sm" onClick={() => onWhatsApp(customer.whatsapp)} className="text-green-600 border-green-500 hover:bg-green-50">WhatsApp</Button>
             <Button variant="outline" size="sm" onClick={() => onMap(customer.gps)} className="text-blue-600 border-blue-500 hover:bg-blue-50">Mapa</Button>
             <Button variant="outline" size="sm" onClick={() => onEdit(customer)} className="text-yellow-600 border-yellow-500 hover:bg-yellow-50">Editar</Button>
             <Button variant="destructive" size="sm" onClick={() => onDelete(customer.id)}>Eliminar</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CustomerCardView;
