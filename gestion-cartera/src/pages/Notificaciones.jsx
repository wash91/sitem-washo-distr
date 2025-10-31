import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send, Copy, Check } from 'lucide-react';
import { getAllDebtors } from '../services/debtorService';
import { getAllProjects } from '../services/projectService';
import {
  logMultipleNotifications,
  prepareWhatsAppReminders,
  NOTIFICATION_TYPES,
  NOTIFICATION_STATUS
} from '../services/notificationService';

const Notificaciones = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [debtors, setDebtors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [whatsappReminders, setWhatsappReminders] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    includeDebtInfo: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [debtorsResult, projectsResult] = await Promise.all([
      getAllDebtors(),
      getAllProjects()
    ]);

    if (debtorsResult.success) setDebtors(debtorsResult.data);
    if (projectsResult.success) setProjects(projectsResult.data);
  };

  const getFilteredDebtors = () => {
    if (selectedProject === 'all') return debtors;
    return debtors.filter(d => d.projectId === selectedProject);
  };

  const handleSendEmails = async () => {
    if (!emailData.subject.trim() || !emailData.body.trim()) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
      return;
    }

    const filteredDebtors = getFilteredDebtors();
    if (filteredDebtors.length === 0) {
      setMessage({ type: 'error', text: 'No hay deudores para enviar' });
      return;
    }

    setLoading(true);

    // Simular envío de correos (en producción, usar Firebase Functions o API de email)
    const notifications = filteredDebtors.map(debtor => ({
      type: NOTIFICATION_TYPES.EMAIL,
      status: NOTIFICATION_STATUS.SENT,
      debtorId: debtor.id,
      debtorName: debtor.name,
      debtorEmail: debtor.email,
      subject: emailData.subject,
      content: emailData.includeDebtInfo
        ? `${emailData.body}\n\nMonto adeudado: $${debtor.debtAmount}`
        : emailData.body,
      projectId: selectedProject !== 'all' ? selectedProject : null
    }));

    const result = await logMultipleNotifications(notifications);

    if (result.success) {
      setMessage({
        type: 'success',
        text: `Se registraron ${notifications.length} correos para envío. Configura Firebase Functions para el envío real.`
      });
      setEmailData({ subject: '', body: '', includeDebtInfo: true });
    } else {
      setMessage({ type: 'error', text: 'Error al registrar notificaciones' });
    }

    setLoading(false);
  };

  const handlePrepareWhatsApp = () => {
    const filteredDebtors = getFilteredDebtors();
    if (filteredDebtors.length === 0) {
      setMessage({ type: 'error', text: 'No hay deudores para generar recordatorios' });
      return;
    }

    const reminders = prepareWhatsAppReminders(filteredDebtors);
    setWhatsappReminders(reminders);

    // Registrar recordatorios
    const notifications = filteredDebtors.map(debtor => ({
      type: NOTIFICATION_TYPES.WHATSAPP,
      status: NOTIFICATION_STATUS.PENDING,
      debtorId: debtor.id,
      debtorName: debtor.name,
      debtorPhone: debtor.phone,
      content: `Hola ${debtor.name}, le recordamos que tiene una deuda pendiente de $${debtor.debtAmount}`,
      projectId: selectedProject !== 'all' ? selectedProject : null
    }));

    logMultipleNotifications(notifications);

    setMessage({
      type: 'success',
      text: `Se generaron ${reminders.length} recordatorios de WhatsApp`
    });
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredDebtors = getFilteredDebtors();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>
        <p className="text-gray-600 mt-1">Envía correos masivos y genera recordatorios de WhatsApp</p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Proyecto</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="input-field max-w-md"
        >
          <option value="all">Todos los deudores ({debtors.length})</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.debtorCount || 0} deudores)
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-600 mt-2">
          Deudores seleccionados: <strong>{filteredDebtors.length}</strong>
        </p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-4 border-b mb-6">
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
              activeTab === 'email'
                ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Mail size={20} />
            Correos Masivos
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`pb-3 px-4 flex items-center gap-2 transition-colors ${
              activeTab === 'whatsapp'
                ? 'border-b-2 border-primary-600 text-primary-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <MessageCircle size={20} />
            Recordatorios WhatsApp
          </button>
        </div>

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="input-field"
                placeholder="Recordatorio de pago pendiente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
              <textarea
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                className="input-field"
                rows="8"
                placeholder="Estimado/a cliente,&#10;&#10;Le recordamos que tiene un pago pendiente...&#10;&#10;Atentamente,&#10;Equipo de Cobranzas"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeDebt"
                checked={emailData.includeDebtInfo}
                onChange={(e) => setEmailData({ ...emailData, includeDebtInfo: e.target.checked })}
                className="w-4 h-4 text-primary-600"
              />
              <label htmlFor="includeDebt" className="text-sm text-gray-700">
                Incluir información de la deuda en cada correo
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Para envíos reales, configura Firebase Functions con un
                servicio de email (Gmail SMTP, SendGrid, etc.). Por ahora, las notificaciones se
                registran en la base de datos.
              </p>
            </div>

            <button
              onClick={handleSendEmails}
              disabled={loading || filteredDebtors.length === 0}
              className="btn-primary flex items-center gap-2"
            >
              <Send size={20} />
              {loading ? 'Enviando...' : `Enviar ${filteredDebtors.length} Correos`}
            </button>
          </div>
        )}

        {/* WhatsApp Tab */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Recordatorio:</strong> Los mensajes se generan para envío manual desde tu
                WhatsApp Business. Copia cada mensaje y envíalo al número indicado.
              </p>
            </div>

            <button
              onClick={handlePrepareWhatsApp}
              disabled={filteredDebtors.length === 0}
              className="btn-primary flex items-center gap-2 mb-4"
            >
              <MessageCircle size={20} />
              Generar {filteredDebtors.length} Recordatorios
            </button>

            {whatsappReminders.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {whatsappReminders.map((reminder, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{reminder.name}</p>
                        <p className="text-sm text-gray-600">{reminder.phone}</p>
                        <p className="text-sm text-green-600 font-medium">
                          Deuda: ${reminder.debtAmount?.toLocaleString('es-CR')}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(reminder.message, index)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check size={16} />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-gray-100 rounded p-3 text-sm text-gray-700">
                      {reminder.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificaciones;
