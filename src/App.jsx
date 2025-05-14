
import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Context
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

// Pages - Eagerly load LoginPage as it's the first potential interaction
import LoginPage from "@/pages/auth/LoginPage";

// Lazy load other pages
const SalesPage = lazy(() => import("@/pages/app/SalesPage"));
const CustomersPage = lazy(() => import("@/pages/app/CustomersPage"));
const RefillsPage = lazy(() => import("@/pages/app/RefillsPage"));
const ExpensesPage = lazy(() => import("@/pages/app/ExpensesPage"));
const CashOpenPage = lazy(() => import("@/pages/app/CashOpenPage"));
const CashClosePage = lazy(() => import("@/pages/app/CashClosePage"));
const DashboardPage = lazy(() => import("@/pages/app/DashboardPage"));
const UsersPage = lazy(() => import("@/pages/app/UsersPage")); 
const TrucksPage = lazy(() => import("@/pages/app/TrucksPage"));
const TruckInventoryPage = lazy(() => import("@/pages/app/TruckInventoryPage"));
const AdminTruckInventoryPage = lazy(() => import("@/pages/app/admin/AdminTruckInventoryPage"));
const OrdersManagementPage = lazy(() => import("@/pages/app/orders/OrdersManagementPage"));
const AssignedOrdersPage = lazy(() => import("@/pages/app/AssignedOrdersPage"));
const ProductsManagementPage = lazy(() => import("@/pages/app/ProductsManagementPage"));
const ReportsPage = lazy(() => import("@/pages/app/ReportsPage"));
const AccountsReceivablePage = lazy(() => import("@/pages/app/accounts/AccountsReceivablePage"));
const PermissionsPage = lazy(() => import("@/pages/app/permissions/PermissionsPage"));
const AppointmentsPage = lazy(() => import("@/pages/app/appointments/AppointmentsPage"));
const DistributorDashboardPage = lazy(() => import("@/pages/app/distributor/DistributorDashboardPage"));


const ROLES = {
  ADMIN: 'admin',
  DISTRIBUTOR: 'distributor',
};

const LoadingScreen = () => (
  <div className="h-screen w-full flex items-center justify-center water-bg">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
        className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-500 opacity-80 water-drop"
      />
      <motion.h1
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-3xl font-bold text-white"
      >
        Distribuidor Autorizado
      </motion.h1>
      <p className="text-white mt-2">Cargando tu experiencia...</p>
    </motion.div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles, requiredPermission = null }) => {
  const { user, loadingAuth, hasPermission } = useAuth();

  if (loadingAuth) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; 
  }

  if (requiredPermission) {
    if (user.role !== ROLES.ADMIN && !hasPermission(requiredPermission)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
};


const AppContent = () => {
  const { user, loadingAuth } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!loadingAuth && user) {
      toast({
        title: `¡Bienvenido de nuevo, ${user.name}!`,
        description: `Rol: ${user.role === ROLES.ADMIN ? 'Administrador' : 'Distribuidor'}`,
      });
    }
  }, [user, loadingAuth, toast]);

  if (loadingAuth) {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={user ? 'app' : 'auth'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex flex-col"
      >
        <Routes>
          <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISTRIBUTOR]}>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to={user?.role === ROLES.ADMIN ? "/dashboard" : "/dashboard-distribuidor"} replace />} />
                    
                    <Route path="/dashboard-distribuidor" element={<ProtectedRoute allowedRoles={[ROLES.DISTRIBUTOR]} requiredPermission="viewDistributorDashboard"><DistributorDashboardPage /></ProtectedRoute>} />
                    <Route path="/pedidos-asignados" element={<ProtectedRoute allowedRoles={[ROLES.DISTRIBUTOR]} requiredPermission="viewAssignedOrders"><AssignedOrdersPage /></ProtectedRoute>} />
                    <Route path="/inventario-camion" element={<ProtectedRoute allowedRoles={[ROLES.DISTRIBUTOR]} requiredPermission="viewTruckInventory"><TruckInventoryPage /></ProtectedRoute>} />
                    
                    <Route path="/ventas" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISTRIBUTOR]} requiredPermission="manageSales"><SalesPage /></ProtectedRoute>} />
                    <Route path="/clientes" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISTRIBUTOR]} requiredPermission="manageCustomers"><CustomersPage /></ProtectedRoute>} />
                    <Route path="/recargas" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISTRIBUTOR]} requiredPermission="manageRefills"><RefillsPage /></ProtectedRoute>} />
                    <Route path="/gastos" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISTRIBUTOR]} requiredPermission="manageExpenses"><ExpensesPage /></ProtectedRoute>} />
                    <Route path="/apertura-caja" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISTRIBUTOR]} requiredPermission="manageCashOpenings"><CashOpenPage /></ProtectedRoute>} />
                    <Route path="/cierre-caja" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISTRIBUTOR]} requiredPermission="manageCashClosings"><CashClosePage /></ProtectedRoute>} />
                    <Route path="/cuentas-por-cobrar" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISTRIBUTOR]} requiredPermission="manageReceivables"><AccountsReceivablePage /></ProtectedRoute>} />
                    <Route path="/agendamiento" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DISTRIBUTOR]} requiredPermission="manageAppointments"><AppointmentsPage /></ProtectedRoute>} />
                    
                    <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><DashboardPage /></ProtectedRoute>} />
                    <Route path="/pedidos-gestion" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><OrdersManagementPage /></ProtectedRoute>} />
                    <Route path="/productos-gestion" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ProductsManagementPage /></ProtectedRoute>} />
                    <Route path="/reportes" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ReportsPage /></ProtectedRoute>} />
                    <Route path="/usuarios" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><UsersPage /></ProtectedRoute>} />
                    <Route path="/camiones" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><TrucksPage /></ProtectedRoute>} />
                    <Route path="/admin-inventario-camion" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminTruckInventoryPage /></ProtectedRoute>} />
                    <Route path="/permisos" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><PermissionsPage /></ProtectedRoute>} />
                    
                    <Route path="*" element={<Navigate to={user?.role === ROLES.ADMIN ? "/dashboard" : "/dashboard-distribuidor"} replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Suspense fallback={<LoadingScreen />}>
            <AppContent />
          </Suspense>
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
