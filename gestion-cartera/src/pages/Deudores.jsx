import { useState, useEffect } from 'react';
import { Upload, Download, Users, Search, Trash2, Edit, Plus } from 'lucide-react';
import { getAllDebtors, createMultipleDebtors, deleteDebtor } from '../services/debtorService';
import { processExcelFile, validateDebtorData, normalizeDebtorData, generateExcelTemplate } from '../utils/excelProcessor';

const Deudores = () => {
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadDebtors();
  }, []);

  const loadDebtors = async () => {
    setLoading(true);
    const result = await getAllDebtors();
    if (result.success) {
      setDebtors(result.data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      // Procesar archivo
      const rawData = await processExcelFile(file);

      // Validar datos
      const validation = validateDebtorData(rawData);
      if (!validation.isValid) {
        setMessage({
          type: 'error',
          text: `Errores en el archivo:\n${validation.errors.join('\n')}`
        });
        setUploading(false);
        return;
      }

      // Normalizar y guardar
      const normalizedData = normalizeDebtorData(rawData);
      const result = await createMultipleDebtors(normalizedData);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Se cargaron exitosamente ${normalizedData.length} deudores`
        });
        loadDebtors();
      } else {
        setMessage({
          type: 'error',
          text: `Error al guardar los datos: ${result.error}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error procesando el archivo: ${error.message}`
      });
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (debtorId) => {
    if (!confirm('¿Estás seguro de eliminar este deudor?')) return;

    const result = await deleteDebtor(debtorId);
    if (result.success) {
      setMessage({ type: 'success', text: 'Deudor eliminado correctamente' });
      loadDebtors();
    } else {
      setMessage({ type: 'error', text: `Error: ${result.error}` });
    }
  };

  const filteredDebtors = debtors.filter(debtor =>
    debtor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    debtor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    debtor.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Deudores</h1>
          <p className="text-gray-600 mt-1">Gestiona tu cartera de deudores</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateExcelTemplate}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={20} />
            Descargar Plantilla
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <pre className="whitespace-pre-wrap text-sm">{message.text}</pre>
        </div>
      )}

      {/* Upload Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Cargar Deudores desde Excel</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <label className="cursor-pointer">
            <span className="btn-primary inline-block">
              {uploading ? 'Cargando...' : 'Seleccionar Archivo Excel'}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-600 mt-4">
            Formatos aceptados: .xlsx, .xls
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Campos requeridos: nombre, email, telefono, monto_deuda
          </p>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email o teléfono..."
                className="input-field pl-10 w-80"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{debtors.length}</span> deudores
          </div>
        </div>

        {/* Debtors Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando deudores...</p>
          </div>
        ) : filteredDebtors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-gray-600 text-lg mb-2">No hay deudores registrados</p>
            <p className="text-gray-500 text-sm">Comienza cargando un archivo Excel</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monto Deuda</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDebtors.map((debtor) => (
                  <tr key={debtor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{debtor.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{debtor.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{debtor.phone}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                      ${debtor.debtAmount?.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(debtor.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deudores;
