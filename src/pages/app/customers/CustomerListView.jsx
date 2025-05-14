
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin, MessageSquare as WhatsAppIcon, Phone as PhoneIcon } from 'lucide-react';

const CustomerListView = ({ customers, onEdit, onDelete, onWhatsApp, onMap, onCall }) => {
  if (customers.length === 0) {
    return <p className="text-center py-8 text-gray-500">No se encontraron clientes con los filtros actuales.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map(customer => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{customer.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={customer.address}>{customer.address}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onCall(customer.phone)} title="Llamar">
                    <PhoneIcon className="h-4 w-4 text-purple-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onWhatsApp(customer.whatsapp)} title="WhatsApp">
                    <WhatsAppIcon className="h-4 w-4 text-green-500" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => onMap(customer.gps)} title="Ver en Mapa">
                    <MapPin className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(customer)} title="Editar">
                  <Edit className="h-4 w-4 text-yellow-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(customer.id)} title="Eliminar">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerListView;
