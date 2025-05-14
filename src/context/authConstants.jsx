
import React from 'react';

export const ROLES = {
  ADMIN: 'admin',
  DISTRIBUTOR: 'distributor',
};

export const allPermissionsList = [
  { id: 'viewAdminDashboard', name: 'Ver Dashboard Admin', description: 'Permite ver el dashboard principal de administrador.' },
  { id: 'manageUsers', name: 'Gestionar Usuarios', description: 'Permite crear, editar y eliminar usuarios.' },
  { id: 'managePermissions', name: 'Gestionar Permisos', description: 'Permite asignar y revocar permisos a roles o usuarios.' },
  { id: 'manageProducts', name: 'Gestionar Productos', description: 'Permite añadir, editar y eliminar productos del catálogo.' },
  { id: 'manageTrucks', name: 'Gestionar Camiones', description: 'Permite añadir, editar y eliminar camiones.' },
  { id: 'manageTruckInventoryAdmin', name: 'Gestionar Inventario Camiones (Admin)', description: 'Permite ver y ajustar el inventario de todos los camiones.' },
  { id: 'manageOrders', name: 'Gestionar Pedidos (Admin)', description: 'Permite crear, asignar y supervisar todos los pedidos.' },
  { id: 'viewReports', name: 'Ver Reportes', description: 'Permite acceder a los reportes de ventas, gastos, etc.' },
  
  { id: 'viewDistributorDashboard', name: 'Ver Dashboard Distribuidor', description: 'Permite ver el dashboard específico para distribuidores.' },
  { id: 'manageSales', name: 'Gestionar Ventas', description: 'Permite registrar nuevas ventas y ver historial (propio para distribuidor).' },
  { id: 'manageCustomers', name: 'Gestionar Clientes', description: 'Permite añadir y editar clientes (propios para distribuidor).' },
  { id: 'manageRefills', name: 'Gestionar Recargas', description: 'Permite registrar recargas de inventario para el camión asignado.' },
  { id: 'manageExpenses', name: 'Gestionar Gastos', description: 'Permite registrar gastos operativos (propios para distribuidor).' },
  { id: 'manageCashOpenings', name: 'Gestionar Aperturas de Caja', description: 'Permite registrar la apertura de caja al inicio del día.' },
  { id: 'manageCashClosings', name: 'Gestionar Cierres de Caja', description: 'Permite registrar el cierre de caja al final del día.' },
  { id: 'viewTruckInventory', name: 'Ver Inventario del Camión', description: 'Permite ver el inventario actual del camión asignado.' },
  { id: 'viewAssignedOrders', name: 'Ver Pedidos Asignados', description: 'Permite ver y gestionar los pedidos asignados al distribuidor.' },
  { id: 'manageReceivables', name: 'Gestionar Cuentas por Cobrar', description: 'Permite gestionar y registrar pagos de cuentas por cobrar.' },
  { id: 'manageAppointments', name: 'Gestionar Agendamientos', description: 'Permite crear y gestionar agendamientos de entregas o servicios.' },
];
