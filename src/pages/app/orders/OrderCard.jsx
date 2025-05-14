
import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Truck as TruckIcon, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const OrderCard = ({ order, onEdit, onDelete, statusTranslations }) => {

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'assigned': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-indigo-100 text-indigo-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-blue-700">{order.customerName}</h3>
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {statusTranslations[order.status] || order.status}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">ID Pedido: ...{order.id.slice(-6)}</p>
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-gray-400"/> {format(new Date(order.createdAt || Date.now()), 'dd/MM/yyyy HH:mm')}
                </p>
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <TruckIcon className="h-4 w-4 mr-1 text-gray-400"/> {order.assignedDistributorName || 'No asignado'}
                </p>
                
                <div className="mb-2">
                    <p className="text-xs font-medium text-gray-700">Productos:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 max-h-20 overflow-y-auto">
                        {order.items.map((item, idx) => (
                            <li key={`${item.productId}-${idx}`}>{item.quantity}x {item.productName} (${parseFloat(item.price).toFixed(2)} c/u)</li>
                        ))}
                    </ul>
                </div>
                <p className="text-md font-bold text-right text-green-600 mb-3">Total: ${parseFloat(order.totalAmount).toFixed(2)}</p>
                
                {order.observations && <p className="text-xs italic text-gray-500 mb-3 bg-yellow-50 p-2 rounded-md">Obs: {order.observations}</p>}
            </div>

            <div className="flex justify-end space-x-2 mt-auto pt-3 border-t">
                <Button variant="ghost" size="icon" onClick={() => onEdit(order)} title="Editar Pedido">
                    <Edit className="h-4 w-4 text-yellow-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {
                    if(window.confirm("¿Está seguro que desea eliminar este pedido? Esta acción no se puede deshacer.")) {
                        onDelete(order.id);
                    }
                }} title="Eliminar Pedido">
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </div>
        </motion.div>
    );
};

export default OrderCard;
