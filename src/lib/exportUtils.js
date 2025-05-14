
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToCsv = (data, filename = 'clientes') => {
  const worksheet = XLSX.utils.json_to_sheet(data.map(customer => ({
    ID: customer.id,
    Nombre: customer.name,
    Tipo: customer.type,
    Teléfono: customer.phone,
    WhatsApp: customer.whatsapp,
    Dirección: customer.address,
    Referencia: customer.reference,
    'CI/RUC': customer.ciRuc,
    'Fecha de Nacimiento': customer.birthDate ? format(new Date(customer.birthDate), 'dd/MM/yyyy') : 'N/A',
    GPS: customer.gps ? `${customer.gps.lat}, ${customer.gps.lng}` : 'N/A',
    'Última Visita': customer.lastVisit ? format(new Date(customer.lastVisit), 'dd/MM/yyyy HH:mm') : 'N/A',
    Deuda: customer.debt || 0,
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  XLSX.writeFile(workbook, `${filename}_${timestamp}.csv`);
};

export const exportToPdf = (data, filename = 'clientes') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Lista de Clientes', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 29);

  const tableColumn = ["Nombre", "Tipo", "Teléfono", "Dirección", "CI/RUC"];
  const tableRows = [];

  data.forEach(customer => {
    const customerData = [
      customer.name,
      customer.type,
      customer.phone || 'N/A',
      customer.address || 'N/A',
      customer.ciRuc || 'N/A',
    ];
    tableRows.push(customerData);
  });

  doc.autoTable({
    startY: 35,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 133] },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
        0: {cellWidth: 40}, 
        1: {cellWidth: 25},
        2: {cellWidth: 30},
        3: {cellWidth: 60},
        4: {cellWidth: 30},
    }
  });
  
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  doc.save(`${filename}_${timestamp}.pdf`);
};
