import * as XLSX from 'xlsx';

// Procesar archivo Excel y convertir a datos
export const processExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Obtener la primera hoja
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        resolve(jsonData);
      } catch (error) {
        reject(new Error('Error procesando el archivo Excel: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error leyendo el archivo'));
    };

    reader.readAsArrayBuffer(file);
  });
};

// Validar estructura del Excel para deudores
export const validateDebtorData = (data) => {
  const requiredFields = ['nombre', 'email', 'telefono', 'monto_deuda'];
  const errors = [];

  data.forEach((row, index) => {
    const missingFields = requiredFields.filter(field => !row[field]);
    if (missingFields.length > 0) {
      errors.push(`Fila ${index + 2}: Faltan campos requeridos: ${missingFields.join(', ')}`);
    }

    // Validar email
    if (row.email && !isValidEmail(row.email)) {
      errors.push(`Fila ${index + 2}: Email inválido (${row.email})`);
    }

    // Validar teléfono
    if (row.telefono && !isValidPhone(row.telefono)) {
      errors.push(`Fila ${index + 2}: Teléfono inválido (${row.telefono})`);
    }

    // Validar monto
    if (row.monto_deuda && isNaN(parseFloat(row.monto_deuda))) {
      errors.push(`Fila ${index + 2}: Monto de deuda inválido (${row.monto_deuda})`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Normalizar datos del Excel al formato de la BD
export const normalizeDebtorData = (rawData) => {
  return rawData.map(row => ({
    name: row.nombre || row.Nombre || row.NOMBRE || '',
    email: row.email || row.Email || row.EMAIL || '',
    phone: cleanPhone(row.telefono || row.Telefono || row.TELEFONO || ''),
    debtAmount: parseFloat(row.monto_deuda || row.Monto_Deuda || row.MONTO_DEUDA || 0),
    identification: row.cedula || row.Cedula || row.CEDULA || '',
    address: row.direccion || row.Direccion || row.DIRECCION || '',
    notes: row.notas || row.Notas || row.NOTAS || '',
    status: 'pending',
    projectId: null
  }));
};

// Validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar teléfono
const isValidPhone = (phone) => {
  const cleanedPhone = phone.toString().replace(/\D/g, '');
  return cleanedPhone.length >= 8 && cleanedPhone.length <= 15;
};

// Limpiar número de teléfono
const cleanPhone = (phone) => {
  return phone.toString().replace(/\D/g, '');
};

// Generar plantilla Excel para descarga
export const generateExcelTemplate = () => {
  const templateData = [
    {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '50612345678',
      monto_deuda: 1500,
      cedula: '1-1234-5678',
      direccion: 'San José, Costa Rica',
      notas: 'Cliente frecuente'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

  // Generar archivo
  XLSX.writeFile(workbook, 'plantilla_deudores.xlsx');
};
