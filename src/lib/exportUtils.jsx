
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

export const exportCashClosingToPdf = async (closingData, openingData, denominationsList) => {
  const doc = new jsPDF();
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const filename = `cierre_pdf_${closingData.id.substring(0,8)}_${timestamp}.pdf`;

  doc.setFontSize(16);
  doc.text('CIERRE DE CAJA DETALLADO', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Fecha de Cierre: ${format(new Date(closingData.date), 'dd/MM/yyyy HH:mm')}`, 14, 25);
  doc.text(`Distribuidor: ${closingData.distributorName}`, 14, 30);
  doc.text(`ID Cierre: ${closingData.id}`, 14, 35);
  doc.text(`ID Apertura: ${closingData.openingId}`, 14, 40);
  
  const summaryData = [
    ['Efectivo Base (Apertura)', (openingData?.cashAmount || 0).toFixed(2)],
    ['Ventas en Efectivo', closingData.totalSales.toFixed(2)],
    ['Abonos Recibidos en Efectivo', (closingData.totalPaymentsReceived || 0).toFixed(2)],
    ['Gastos en Efectivo', closingData.totalExpenses.toFixed(2)],
    ['Total Efectivo Esperado', ((openingData?.cashAmount || 0) + closingData.totalSales + (closingData.totalPaymentsReceived || 0) - closingData.totalExpenses).toFixed(2)],
    ['Total Efectivo Contado', closingData.cashCounted.toFixed(2)],
    ['Diferencia', `${closingData.difference.toFixed(2)} (${closingData.difference < 0 ? "Faltante" : closingData.difference > 0 ? "Sobrante" : "Cuadrado"})`],
  ];

  doc.autoTable({
    startY: 45,
    head: [['Concepto', 'Monto ($)']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [66, 73, 119] }, // Purple
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  if (closingData.denominationQuantities && Object.keys(closingData.denominationQuantities).length > 0) {
    doc.setFontSize(12);
    doc.text('Desglose de Efectivo Contado:', 14, finalY);
    finalY += 7;

    const denominationRows = [];
    let totalCoins = 0;
    let totalBills = 0;

    denominationsList.filter(d => d.type === 'coin').forEach(denom => {
        const quantity = closingData.denominationQuantities[denom.id] || 0;
        if (quantity > 0) {
            const subtotal = quantity * denom.value;
            denominationRows.push([denom.label, quantity.toString(), subtotal.toFixed(2)]);
            totalCoins += subtotal;
        }
    });
    if (totalCoins > 0) {
        denominationRows.push([{content: 'Total Monedas', styles: {fontStyle: 'bold'}}, '', {content: totalCoins.toFixed(2), styles: {fontStyle: 'bold'}}]);
    }
    
    denominationsList.filter(d => d.type === 'bill').forEach(denom => {
        const quantity = closingData.denominationQuantities[denom.id] || 0;
        if (quantity > 0) {
            const subtotal = quantity * denom.value;
            denominationRows.push([denom.label, quantity.toString(), subtotal.toFixed(2)]);
            totalBills += subtotal;
        }
    });
    if (totalBills > 0) {
        denominationRows.push([{content: 'Total Billetes', styles: {fontStyle: 'bold'}}, '', {content: totalBills.toFixed(2), styles: {fontStyle: 'bold'}}]);
    }


    if(denominationRows.length > 0) {
        doc.autoTable({
            startY: finalY,
            head: [['Denominación', 'Cantidad', 'Subtotal ($)']],
            body: denominationRows,
            theme: 'striped',
            headStyles: { fillColor: [156, 163, 175] }, // Gray
            styles: { fontSize: 8, cellPadding: 1.5 },
        });
        finalY = doc.lastAutoTable.finalY + 10;
    }
  }
  
  doc.setFontSize(10);
  doc.text('Comentarios:', 14, finalY);
  finalY += 5;
  doc.setFontSize(9);
  const comments = closingData.comments || 'N/A';
  const splitComments = doc.splitTextToSize(comments, 180);
  doc.text(splitComments, 14, finalY);
  finalY += (splitComments.length * 4) + 5;

  if (closingData.signature) {
    try {
      const imgWidth = 50;
      const imgHeight = 25;
      if (finalY + imgHeight > doc.internal.pageSize.height - 10) {
        doc.addPage();
        finalY = 15;
      }
      doc.setFontSize(10);
      doc.text('Firma del Distribuidor:', 14, finalY);
      finalY += 5;
      doc.addImage(closingData.signature, 'PNG', 14, finalY, imgWidth, imgHeight);
    } catch (e) {
      console.error("Error adding signature image to PDF:", e);
      doc.text("Error al cargar la firma.", 14, finalY + 5);
    }
  }
  doc.save(filename);
};

export const exportCashClosingToExcel = async (closingData, openingData, denominationsList) => {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const filename = `cierre_excel_${closingData.id.substring(0,8)}_${timestamp}.xlsx`;
  
  const wb = XLSX.utils.book_new();
  
  const summaryData = [
    { Concepto: "ID Cierre", Valor: closingData.id },
    { Concepto: "ID Apertura", Valor: closingData.openingId },
    { Concepto: "Fecha Cierre", Valor: format(new Date(closingData.date), 'dd/MM/yyyy HH:mm') },
    { Concepto: "Distribuidor", Valor: closingData.distributorName },
    { Concepto: "", Valor: ""},
    { Concepto: "Efectivo Base (Apertura)", Valor: (openingData?.cashAmount || 0) },
    { Concepto: "Ventas en Efectivo", Valor: closingData.totalSales },
    { Concepto: "Abonos Recibidos en Efectivo", Valor: (closingData.totalPaymentsReceived || 0) },
    { Concepto: "Gastos en Efectivo", Valor: closingData.totalExpenses },
    { Concepto: "Total Efectivo Esperado", Valor: ((openingData?.cashAmount || 0) + closingData.totalSales + (closingData.totalPaymentsReceived || 0) - closingData.totalExpenses) },
    { Concepto: "Total Efectivo Contado", Valor: closingData.cashCounted },
    { Concepto: "Diferencia", Valor: closingData.difference },
    { Concepto: "Estado Diferencia", Valor: closingData.difference < 0 ? "Faltante" : closingData.difference > 0 ? "Sobrante" : "Cuadrado" },
    { Concepto: "", Valor: ""},
    { Concepto: "Comentarios", Valor: closingData.comments || 'N/A' },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen Cierre");

  if (closingData.denominationQuantities && Object.keys(closingData.denominationQuantities).length > 0) {
    const denominationData = [];
    denominationData.push({ Denominacion: "MONEDAS", Cantidad: "", Subtotal: ""});
     let totalCoins = 0;
    denominationsList.filter(d => d.type === 'coin').forEach(denom => {
        const quantity = closingData.denominationQuantities[denom.id] || 0;
        if (quantity > 0) {
            const subtotal = quantity * denom.value;
            denominationData.push({ Denominacion: denom.label, Cantidad: quantity, Subtotal: subtotal });
            totalCoins += subtotal;
        }
    });
     if (totalCoins > 0) {
        denominationData.push({ Denominacion: "Total Monedas", Cantidad: "", Subtotal: totalCoins});
    }
    denominationData.push({ Denominacion: "", Cantidad: "", Subtotal: ""});
    denominationData.push({ Denominacion: "BILLETES", Cantidad: "", Subtotal: ""});
    let totalBills = 0;
    denominationsList.filter(d => d.type === 'bill').forEach(denom => {
        const quantity = closingData.denominationQuantities[denom.id] || 0;
        if (quantity > 0) {
            const subtotal = quantity * denom.value;
            denominationData.push({ Denominacion: denom.label, Cantidad: quantity, Subtotal: subtotal });
            totalBills += subtotal;
        }
    });
     if (totalBills > 0) {
        denominationData.push({ Denominacion: "Total Billetes", Cantidad: "", Subtotal: totalBills});
    }
    denominationData.push({ Denominacion: "", Cantidad: "", Subtotal: ""});
    denominationData.push({ Denominacion: "GRAN TOTAL CONTADO", Cantidad: "", Subtotal: closingData.cashCounted });
    
    const wsDenominations = XLSX.utils.json_to_sheet(denominationData);
    XLSX.utils.book_append_sheet(wb, wsDenominations, "Desglose Efectivo");
  }
  
  XLSX.writeFile(wb, filename);
};
