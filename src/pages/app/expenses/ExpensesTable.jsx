
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const ExpensesTable = ({ expenses, isAdmin, currentUser, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuidor</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma Pago</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map(expense => (
            <tr key={expense.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(expense.date), 'dd/MM/yyyy HH:mm')}</td>
              {isAdmin && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.distributorName}</td>}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{expense.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${expense.amount.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{expense.paymentMethod}</td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={expense.observations}>{expense.observations}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                 {(isAdmin || expense.distributorId === currentUser?.id) && (
                  <>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} title="Editar">
                        <Edit className="h-4 w-4 text-yellow-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} title="Eliminar">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                  </>
                 )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {expenses.length === 0 && (
        <p className="text-center py-8 text-gray-500">No se encontraron gastos.</p>
      )}
    </div>
  );
};

export default ExpensesTable;
