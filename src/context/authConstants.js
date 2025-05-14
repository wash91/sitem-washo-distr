
import React from 'react';

export const ROLES = {
    ADMIN: 'admin',
    DISTRIBUTOR: 'distributor',
};

export const allPermissionsList = [
    { id: 'manageSales', label: 'Gestionar Ventas' },
    { id: 'manageCustomers', label: 'Gestionar Clientes' },
    { id: 'manageProducts', label: 'Gestionar Productos (Admin)' },
    { id: 'manageRefills', label: 'Gestionar Recargas (Admin y Dist.)' },
    { id: 'manageCashOpenings', label: 'Gestionar Aperturas de Caja' },
    { id: 'manageCashClosings', label: 'Gestionar Cierres de Caja' },
    { id: 'manageExpenses', label: 'Gestionar Gastos' },
    { id: 'viewReports', label: 'Ver Reportes (Admin)' },
    { id: 'manageUsers', label: 'Gestionar Usuarios (Admin)' },
    { id: 'manageTrucks', label: 'Gestionar Camiones (Admin)' },
    { id: 'viewTruckInventory', label: 'Ver Inventario de Camión (Dist.)' },
    { id: 'manageOrders', label: 'Gestionar Pedidos (Admin)' },
    { id: 'viewAssignedOrders', label: 'Ver Pedidos Asignados (Dist.)' },
    { id: 'manageReceivables', label: 'Gestionar Cuentas por Cobrar'},
    { id: 'managePermissions', label: 'Gestionar Permisos (Admin)'},
    { id: 'manageAppointments', label: 'Agendar Visitas'},
    { id: 'viewDashboard', label: 'Ver Dashboard Principal (Admin)' },
    { id: 'viewDistributorDashboard', label: 'Ver Resumen Diario (Distribuidor)'}
];
