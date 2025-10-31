import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Users, DollarSign } from 'lucide-react';
import { getAllProjects, createProject, deleteProject, PROJECT_TYPES } from '../services/projectService';
import { getAllDebtors, getTopDebtors, updateDebtor } from '../services/debtorService';

const Proyectos = () => {
  const [projects, setProjects] = useState([]);
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: PROJECT_TYPES.CUSTOM,
    topDebtorsLimit: 10
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [projectsResult, debtorsResult] = await Promise.all([
      getAllProjects(),
      getAllDebtors()
    ]);

    if (projectsResult.success) setProjects(projectsResult.data);
    if (debtorsResult.success) setDebtors(debtorsResult.data);
    setLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      setMessage({ type: 'error', text: 'El nombre del proyecto es requerido' });
      return;
    }

    setLoading(true);

    // Si es proyecto de mayores deudores, seleccionar automáticamente
    if (newProject.type === PROJECT_TYPES.TOP_DEBTORS) {
      const topResult = await getTopDebtors(newProject.topDebtorsLimit);
      if (topResult.success) {
        const result = await createProject({
          ...newProject,
          debtorIds: topResult.data.map(d => d.id),
          totalAmount: topResult.data.reduce((sum, d) => sum + (d.debtAmount || 0), 0),
          debtorCount: topResult.data.length
        });

        if (result.success) {
          // Asignar proyecto a los deudores
          for (const debtor of topResult.data) {
            await updateDebtor(debtor.id, { projectId: result.id });
          }

          setMessage({
            type: 'success',
            text: `Proyecto creado con ${topResult.data.length} mayores deudores`
          });
          setShowModal(false);
          resetForm();
          loadData();
        } else {
          setMessage({ type: 'error', text: result.error });
        }
      }
    } else {
      // Proyecto personalizado
      const result = await createProject({
        ...newProject,
        debtorIds: [],
        totalAmount: 0,
        debtorCount: 0
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Proyecto creado exitosamente' });
        setShowModal(false);
        resetForm();
        loadData();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    }

    setLoading(false);
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    const result = await deleteProject(projectId);
    if (result.success) {
      setMessage({ type: 'success', text: 'Proyecto eliminado correctamente' });
      loadData();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const resetForm = () => {
    setNewProject({
      name: '',
      description: '',
      type: PROJECT_TYPES.CUSTOM,
      topDebtorsLimit: 10
    });
  };

  const getProjectTypeLabel = (type) => {
    const labels = {
      [PROJECT_TYPES.TOP_DEBTORS]: 'Mayores Deudores',
      [PROJECT_TYPES.PAYMENT_AGREEMENTS]: 'Acuerdos de Pago',
      [PROJECT_TYPES.OVERDUE]: 'Vencidos',
      [PROJECT_TYPES.CUSTOM]: 'Personalizado'
    };
    return labels[type] || 'Desconocido';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Proyectos</h1>
          <p className="text-gray-600 mt-1">Organiza tu cartera por proyectos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Proyecto
        </button>
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

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proyectos...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-12">
          <FolderOpen className="mx-auto mb-4 text-gray-300" size={64} />
          <p className="text-gray-600 text-lg mb-2">No hay proyectos creados</p>
          <p className="text-gray-500 text-sm mb-6">
            Los proyectos te ayudan a organizar y gestionar tu cartera
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Crear Primer Proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FolderOpen className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{project.name}</h3>
                    <span className="text-xs text-gray-500">
                      {getProjectTypeLabel(project.type)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {project.description || 'Sin descripción'}
              </p>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users size={16} />
                    Deudores
                  </span>
                  <span className="font-semibold text-gray-800">
                    {project.debtorCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <DollarSign size={16} />
                    Total
                  </span>
                  <span className="font-semibold text-green-600">
                    ${(project.totalAmount || 0).toLocaleString('es-CR', {
                      minimumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {project.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Nuevo Proyecto</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: 10 Mayores Deudores"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Proyecto
                </label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                  className="input-field"
                >
                  <option value={PROJECT_TYPES.CUSTOM}>Personalizado</option>
                  <option value={PROJECT_TYPES.TOP_DEBTORS}>Mayores Deudores</option>
                  <option value={PROJECT_TYPES.PAYMENT_AGREEMENTS}>Acuerdos de Pago</option>
                  <option value={PROJECT_TYPES.OVERDUE}>Vencidos</option>
                </select>
              </div>

              {newProject.type === PROJECT_TYPES.TOP_DEBTORS && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de Deudores
                  </label>
                  <input
                    type="number"
                    value={newProject.topDebtorsLimit}
                    onChange={(e) =>
                      setNewProject({ ...newProject, topDebtorsLimit: parseInt(e.target.value) })
                    }
                    className="input-field"
                    min="1"
                    max="100"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Descripción del proyecto..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proyectos;
