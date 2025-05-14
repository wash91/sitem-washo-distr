
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ROLES, allPermissionsList } from '@/context/authConstants.jsx';

export { ROLES, allPermissionsList };

export const initialProducts = [
  { id: uuidv4(), name: 'Botellón Agua 20L', description: 'Agua purificada en botellón retornable de 20 litros', price: 2.50, category: 'Agua', stock_quantity: 100, is_active: true, image_url: 'https://images.unsplash.com/photo-1553787432-405d74000253' },
  { id: uuidv4(), name: 'Paquete Agua 600ml x24', description: 'Paquete de 24 botellas de agua purificada de 600ml', price: 5.00, category: 'Agua Embotellada', stock_quantity: 50, is_active: true, image_url: 'https://images.unsplash.com/photo-1600620590183-e13505495050' },
  { id: uuidv4(), name: 'Dispensador Manual', description: 'Dispensador manual para botellones', price: 8.00, category: 'Accesorios', stock_quantity: 20, is_active: true, image_url: 'https://images.unsplash.com/photo-1604275880934-1c0905970576' },
];
export const initialProductDefinitions = initialProducts;

export const initialTrucks = [
  { id: uuidv4(), name: 'Camión #1', plate_number: 'TRK-001', capacity_bottles: 150, status: 'active' },
  { id: uuidv4(), name: 'Camión #2', plate_number: 'TRK-002', capacity_bottles: 120, status: 'active' },
];

export const initialExpenseCategories = [
  { id: uuidv4(), name: 'Combustible', description: 'Gastos de gasolina o diesel' },
  { id: uuidv4(), name: 'Mantenimiento Vehículo', description: 'Reparaciones, aceite, etc.' },
  { id: uuidv4(), name: 'Comida', description: 'Alimentos y bebidas del distribuidor' },
  { id: uuidv4(), name: 'Peajes', description: 'Pagos de peajes en ruta' },
  { id: uuidv4(), name: 'Otros', description: 'Gastos varios no categorizados' },
];

const mockUserIdAdmin = 'admin-mock-id';
const mockUserIdDistributor = 'distributor-mock-id';

export const initialMockCustomers = [
  { id: uuidv4(), name: 'Cliente Ejemplo 1', phone: '123456789', email: 'cliente1@example.com', address: 'Calle Falsa 123', customer_type: 'residential', notes: 'Llamar antes de llegar', created_by: mockUserIdDistributor },
  { id: uuidv4(), name: 'Negocio ABC', phone: '987654321', email: 'negocio@example.com', address: 'Avenida Siempre Viva 742', customer_type: 'commercial', notes: 'Entregar en recepción', created_by: mockUserIdAdmin },
];

export const initialMockSales = [
  { 
    id: uuidv4(), 
    distributor_id: mockUserIdDistributor, 
    customer_id: initialMockCustomers[0].id, 
    items: [{ productId: initialProducts[0].id, productName: initialProducts[0].name, quantity: 2, unitPrice: initialProducts[0].price, itemTotal: initialProducts[0].price * 2 }], 
    total_amount: initialProducts[0].price * 2, 
    payment_method: 'cash', 
    status: 'completed', 
    sale_date: new Date().toISOString(),
    cash_opening_id: 'opening-mock-id-1', 
    truck_id: initialTrucks[0].id,
  },
];

export const initialMockRefills = [
  { id: uuidv4(), truck_id: initialTrucks[0].id, distributor_id: mockUserIdDistributor, product_id: initialProducts[0].id, quantity_refilled: 50, refill_date: new Date().toISOString() },
];

export const initialMockExpenses = [
  { id: uuidv4(), distributor_id: mockUserIdDistributor, category_id: initialExpenseCategories[0].id, amount: 20.00, description: 'Gasolina para ruta', expense_date: new Date().toISOString() },
];

export const initialMockCashOpenings = [
  { id: 'opening-mock-id-1', distributor_id: mockUserIdDistributor, truck_id: initialTrucks[0].id, opening_amount: 50.00, opening_date: new Date().toISOString().split('T')[0], opening_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) },
];

export const initialMockCashClosings = [
  { id: uuidv4(), cash_opening_id: 'opening-mock-id-1', distributor_id: mockUserIdDistributor, closing_amount_cash: 150.00, closing_amount_card: 0, closing_amount_transfer: 0, total_calculated_sales: 100.00, difference: 0, closing_date: new Date().toISOString().split('T')[0], closing_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) },
];

export const initialMockManagedOrders = [
  { id: uuidv4(), customer_name: 'Nuevo Pedido Cliente', customer_phone: '5551234', customer_address: 'Calle Nueva 456', order_details: [{ productId: initialProducts[1].id, productName: initialProducts[1].name, quantity: 1 }], assigned_distributor_id: mockUserIdDistributor, status: 'assigned', priority: 'high', order_date: new Date().toISOString(), created_by: mockUserIdAdmin },
];

export const initialMockAccountsReceivable = [
  { id: uuidv4(), sale_id: initialMockSales[0].id, customer_id: initialMockCustomers[0].id, amount_due: 20.00, amount_paid: 0, due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' },
];

export const initialMockAppointments = [
  { id: uuidv4(), customer_id: initialMockCustomers[1].id, customer_name: initialMockCustomers[1].name, distributor_id: mockUserIdDistributor, appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), service_details: 'Entrega programada 2 botellones', status: 'pending', created_by: mockUserIdAdmin },
];

export const initialMockTruckInventories = {
  [initialTrucks[0].id]: {
    [initialProducts[0].id]: { truck_id: initialTrucks[0].id, product_id: initialProducts[0].id, quantity: 100, last_updated: new Date().toISOString() },
    [initialProducts[1].id]: { truck_id: initialTrucks[0].id, product_id: initialProducts[1].id, quantity: 50, last_updated: new Date().toISOString() },
  },
  [initialTrucks[1].id]: {
    [initialProducts[0].id]: { truck_id: initialTrucks[1].id, product_id: initialProducts[0].id, quantity: 80, last_updated: new Date().toISOString() },
  },
};

export const defaultPermissions = {
  [ROLES.ADMIN]: allPermissionsList.map(p => p.id),
  [ROLES.DISTRIBUTOR]: [
    'viewDistributorDashboard',
    'manageSales',
    'manageCustomers',
    'viewTruckInventory',
    'manageCashOpenings',
    'manageCashClosings',
    'manageExpenses',
    'viewAssignedOrders',
    'manageAppointments', 
  ],
};
