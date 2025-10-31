import { useState, useEffect } from 'react';
import { Users, DollarSign, Send, FolderOpen, TrendingUp, Mail, MessageCircle } from 'lucide-react';
import { getAllDebtors } from '../services/debtorService';
import { getAllProjects } from '../services/projectService';
import { getNotificationStats } from '../services/notificationService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDebtors: 0,
    totalDebt: 0,
    totalProjects: 0,
    totalNotifications: 0,
    emailsSent: 0,
    whatsappsSent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    // Cargar deudores
    const debtorsResult = await getAllDebtors();
    const debtors = debtorsResult.success ? debtorsResult.data : [];

    // Cargar proyectos
    const projectsResult = await getAllProjects();
    const projects = projectsResult.success ? projectsResult.data : [];

    // Cargar estadísticas de notificaciones
    const notifStats = await getNotificationStats();
    const notifications = notifStats.success ? notifStats.data : { total: 0, byType: {} };

    // Calcular totales
    const totalDebt = debtors.reduce((sum, debtor) => sum + (debtor.debtAmount || 0), 0);

    setStats({
      totalDebtors: debtors.length,
      totalDebt: totalDebt,
      totalProjects: projects.length,
      totalNotifications: notifications.total,
      emailsSent: notifications.byType?.email || 0,
      whatsappsSent: notifications.byType?.whatsapp || 0
    });

    setLoading(false);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema de gestión de cartera</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          title="Total Deudores"
          value={stats.totalDebtors}
          color="bg-blue-500"
        />
        <StatCard
          icon={DollarSign}
          title="Deuda Total"
          value={`$${stats.totalDebt.toLocaleString('es-CR', { minimumFractionDigits: 2 })}`}
          color="bg-green-500"
        />
        <StatCard
          icon={FolderOpen}
          title="Proyectos Activos"
          value={stats.totalProjects}
          color="bg-purple-500"
        />
      </div>

      {/* Estadísticas de notificaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Send}
          title="Notificaciones Enviadas"
          value={stats.totalNotifications}
          color="bg-indigo-500"
        />
        <StatCard
          icon={Mail}
          title="Correos Enviados"
          value={stats.emailsSent}
          color="bg-orange-500"
        />
        <StatCard
          icon={MessageCircle}
          title="WhatsApp Recordatorios"
          value={stats.whatsappsSent}
          color="bg-green-600"
        />
      </div>

      {/* Acciones rápidas */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn-primary">
            <Users size={20} className="mr-2" />
            Agregar Deudores
          </button>
          <button className="btn-primary">
            <FolderOpen size={20} className="mr-2" />
            Nuevo Proyecto
          </button>
          <button className="btn-primary">
            <Mail size={20} className="mr-2" />
            Enviar Correos
          </button>
          <button className="btn-primary">
            <TrendingUp size={20} className="mr-2" />
            Ver Reportes
          </button>
        </div>
      </div>

      {/* Información útil */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Inicio Rápido</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>1. Carga tu archivo Excel con la información de los deudores</li>
          <li>2. Crea proyectos para organizar tu cartera (ej: "10 Mayores Deudores")</li>
          <li>3. Envía notificaciones masivas por correo</li>
          <li>4. Genera recordatorios para WhatsApp</li>
          <li>5. Consulta reportes de envíos y recaudación</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
