
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, ShoppingCart, Package, DollarSign, FileText, LogOut, Home, Calendar, Briefcase, Settings, ClipboardList, Truck, Coins as HandCoins, PackagePlus, FileSignature, ConciergeBell, Warehouse, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const ROLES = {
  ADMIN: 'admin',
  DISTRIBUTOR: 'distributor',
};

const commonLinksBase = [
  { name: 'Ventas', path: '/ventas', icon: <ShoppingCart className="h-5 w-5" />, permission: 'manageSales' },
  { name: 'Clientes', path: '/clientes', icon: <Users2 className="h-5 w-5" />, permission: 'manageCustomers' },
  { name: 'Cuentas por Cobrar', path: '/cuentas-por-cobrar', icon: <HandCoins className="h-5 w-5" />, permission: 'manageReceivables'},
  { name: 'Agendamiento', path: '/agendamiento', icon: <Calendar className="h-5 w-5" />, permission: 'manageAppointments'},
];

const distributorLinksBase = [
  { name: 'Mi Resumen', path: '/dashboard-distribuidor', icon: <LayoutDashboard className="h-5 w-5" />, permission: 'viewDistributorDashboard' }, // Nuevo Dashboard Distribuidor
  { name: 'Pedidos Asignados', path: '/pedidos-asignados', icon: <ClipboardList className="h-5 w-5" />, permission: 'viewAssignedOrders' },
  { name: 'Apertura Caja', path: '/apertura-caja', icon: <PackagePlus className="h-5 w-5" />, permission: 'manageCashOpenings' },
  { name: 'Inventario Camión', path: '/inventario-camion', icon: <Truck className="h-5 w-5" />, permission: 'viewTruckInventory' },
  { name: 'Gastos', path: '/gastos', icon: <ConciergeBell className="h-5 w-5" />, permission: 'manageExpenses' },
  { name: 'Cierre Caja', path: '/cierre-caja', icon: <FileSignature className="h-5 w-5" />, permission: 'manageCashClosings' },
];

const adminLinksOrdered = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'Gestión de Pedidos', path: '/pedidos-gestion', icon: <Briefcase className="h-5 w-5" /> },
  { name: 'Gestión de Productos', path: '/productos-gestion', icon: <Package className="h-5 w-5" /> },
  { name: 'Recargas', path: '/recargas', icon: <Warehouse className="h-5 w-5" />, permission: 'manageRefills' }, 
  { name: 'Gastos', path: '/gastos', icon: <ConciergeBell className="h-5 w-5" />, permission: 'manageExpenses' }, 
  { name: 'Reportes', path: '/reportes', icon: <FileText className="h-5 w-5" /> },
  { name: 'Apertura Caja', path: '/apertura-caja', icon: <PackagePlus className="h-5 w-5" />, permission: 'manageCashOpenings' }, 
  { name: 'Cierre Caja', path: '/cierre-caja', icon: <FileSignature className="h-5 w-5" />, permission: 'manageCashClosings' }, 
  { name: 'Inv. Camiones (Admin)', path: '/admin-inventario-camion', icon: <Truck className="h-5 w-5" /> },
  { name: 'Usuarios', path: '/usuarios', icon: <Users className="h-5 w-5" /> },
  { name: 'Camiones', path: '/camiones', icon: <Truck className="h-5 w-5" /> },
  { name: 'Permisos', path: '/permisos', icon: <Settings className="h-5 w-5" /> },
];


const NavItem = ({ link, currentPath, onClick }) => (
  <Link to={link.path} onClick={onClick}>
    <motion.li
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors
        ${currentPath === link.path 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
        }
      `}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {link.icon}
      <span className="ml-3 font-medium">{link.name}</span>
    </motion.li>
  </Link>
);

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if(isMobile) toggleSidebar();
  };

  const getFilteredLinks = (linksArray) => {
    if (!user) return [];
    if (user.role === ROLES.ADMIN) return linksArray; 
    return linksArray.filter(link => !link.permission || hasPermission(link.permission));
  };

  let finalNavLinks = [];

  if (user?.role === ROLES.ADMIN) {
    const commonForAdmin = getFilteredLinks(commonLinksBase);
    
    const ventasLink = commonForAdmin.find(l => l.name === 'Ventas');
    const clientesLink = commonForAdmin.find(l => l.name === 'Clientes');
    const cuentasPorCobrarLink = commonForAdmin.find(l => l.name === 'Cuentas por Cobrar');
    const agendamientoLink = commonForAdmin.find(l => l.name === 'Agendamiento');

    finalNavLinks = [
        adminLinksOrdered.find(l => l.name === 'Dashboard'),
        adminLinksOrdered.find(l => l.name === 'Gestión de Pedidos'),
        ventasLink,
        clientesLink,
        adminLinksOrdered.find(l => l.name === 'Gestión de Productos'),
        commonForAdmin.find(l => l.name === 'Recargas') || adminLinksOrdered.find(l => l.name === 'Recargas'),
        commonForAdmin.find(l => l.name === 'Gastos') || adminLinksOrdered.find(l => l.name === 'Gastos'),
        cuentasPorCobrarLink,
        agendamientoLink,
        adminLinksOrdered.find(l => l.name === 'Reportes'),
        commonForAdmin.find(l => l.name === 'Apertura Caja') || adminLinksOrdered.find(l => l.name === 'Apertura Caja'),
        commonForAdmin.find(l => l.name === 'Cierre Caja') || adminLinksOrdered.find(l => l.name === 'Cierre Caja'),
        adminLinksOrdered.find(l => l.name === 'Inv. Camiones (Admin)'),
        adminLinksOrdered.find(l => l.name === 'Usuarios'),
        adminLinksOrdered.find(l => l.name === 'Camiones'),
        adminLinksOrdered.find(l => l.name === 'Permisos'),
    ].filter(Boolean); 


  } else if (user?.role === ROLES.DISTRIBUTOR) {
    const relevantCommonLinks = getFilteredLinks(commonLinksBase);
    const relevantDistributorLinks = getFilteredLinks(distributorLinksBase);
    
    finalNavLinks = [
      relevantDistributorLinks.find(l => l.name === 'Mi Resumen'),
      relevantDistributorLinks.find(l => l.name === 'Pedidos Asignados'),
      relevantCommonLinks.find(l => l.name === 'Agendamiento'),
      relevantCommonLinks.find(l => l.name === 'Ventas'),
      relevantCommonLinks.find(l => l.name === 'Clientes'),
      relevantCommonLinks.find(l => l.name === 'Cuentas por Cobrar'),
      relevantDistributorLinks.find(l => l.name === 'Apertura Caja'),
      relevantDistributorLinks.find(l => l.name === 'Inventario Camión'),
      relevantDistributorLinks.find(l => l.name === 'Gastos'),
      relevantDistributorLinks.find(l => l.name === 'Cierre Caja'),
    ].filter(Boolean);
  }
  
  const uniqueNavLinks = finalNavLinks.filter((link, index, self) =>
    index === self.findIndex((l) => (
      l.path === link.path
    ))
  );


  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={isMobile ? "closed" : "open"}
      animate={isOpen ? "open" : "closed"}
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isMobile ? '' : 'translate-x-0'}`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-600 to-indigo-700">
          <Link to="/" className="flex items-center space-x-3" onClick={isMobile ? toggleSidebar : undefined}>
            <Truck size={36} className="text-white" />
            <span className="text-xl font-bold text-white">Distribuidor Autorizado</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <ul>
            {uniqueNavLinks.map((link) => (
              <NavItem key={link.name + link.path} link={link} currentPath={location.pathname} onClick={isMobile ? toggleSidebar : undefined} />
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 text-center">
            <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role === ROLES.ADMIN ? 'Administrador' : 'Distribuidor'}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
