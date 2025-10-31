import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { getAllDebtors } from '../services/debtorService';
import { getNotificationHistory } from '../services/notificationService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Reportes = () => {
  const [stats, setStats] = useState({
    totalDebtors: 0,
    totalDebt: 0,
    averageDebt: 0,
    emailsSent: 0,
    whatsappSent: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [debtors, setDebtors] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);

    const [debtorsResult, notificationsResult] = await Promise.all([
      getAllDebtors(),
      getNotificationHistory()
    ]);

    if (debtorsResult.success) {
      const debtorsList = debtorsResult.data;
      setDebtors(debtorsList);

      const totalDebt = debtorsList.reduce((sum, d) => sum + (d.debtAmount || 0), 0);
      const averageDebt = debtorsList.length > 0 ? totalDebt / debtorsList.length : 0;

      setStats(prev => ({
        ...prev,
        totalDebtors: debtorsList.length,
        totalDebt,
        averageDebt
      }));
    }

    if (notificationsResult.success) {
      const notifList = notificationsResult.data;
      setNotifications(notifList);

      const emailCount = notifList.filter(n => n.type === 'email').length;
      const whatsappCount = notifList.filter(n => n.type === 'whatsapp').length;

      setStats(prev => ({
        ...prev,
        emailsSent: emailCount,
        whatsappSent: whatsappCount,
        recentActivity: notifList.slice(0, 10)
      }));
    }

    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Monto Deuda', 'Estado'];
    const rows = debtors.map(d => [
      d.name,
      d.email,
      d.phone,
      d.debtAmount,
      d.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_deudores_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getTopDebtors = () => {
    return [...debtors]
      .sort((a, b) => (b.debtAmount || 0) - (a.debtAmount || 0))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
          <p className="text-gray-600 mt-1">Análisis y estadísticas de tu cartera</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={20} />
          Exportar CSV
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Deudores</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.totalDebtors}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Deuda Total</p>
              <h3 className="text-2xl font-bold text-green-600">
                ${stats.totalDebt.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Promedio Deuda</p>
              <h3 className="text-2xl font-bold text-orange-600">
                ${stats.averageDebt.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Notificaciones</p>
              <h3 className="text-3xl font-bold text-purple-600">
                {stats.emailsSent + stats.whatsappSent}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {stats.emailsSent} correos, {stats.whatsappSent} WhatsApp
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Debtors */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Mayores Deudores</h2>
        {getTopDebtors().length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay datos disponibles</p>
        ) : (
          <div className="space-y-3">
            {getTopDebtors().map((debtor, index) => (
              <div
                key={debtor.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{debtor.name}</p>
                    <p className="text-sm text-gray-600">{debtor.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    ${debtor.debtAmount?.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
        {stats.recentActivity.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay actividad reciente</p>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'email'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {activity.type === 'email' ? (
                      <Calendar size={16} />
                    ) : (
                      <BarChart3 size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {activity.type === 'email' ? 'Correo enviado' : 'Recordatorio WhatsApp'}
                    </p>
                    <p className="text-xs text-gray-600">{activity.debtorName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {activity.sentAt?.toDate
                      ? format(activity.sentAt.toDate(), "dd MMM yyyy 'a las' HH:mm", { locale: es })
                      : 'Fecha no disponible'}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : activity.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status === 'sent' ? 'Enviado' : activity.status === 'failed' ? 'Fallido' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;
