
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download, Edit, Trash2, FileText, FileSpreadsheet } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { exportCashClosingToPdf, exportCashClosingToExcel } from '@/lib/exportUtils';
import { DENOMINATIONS } from './DenominationCounter';


const CashClosingListItem = ({ closing, isAdmin, cashOpenings, onEdit, onDelete }) => {
    const { toast } = useToast();
    const opening = cashOpenings.find(op => op.id === closing.openingId);

    const handleDownloadTxt = () => {
        const details = `
CIERRE DE CAJA
-------------------------
ID Cierre: ${closing.id}
ID Apertura: ${closing.openingId}
Fecha: ${format(new Date(closing.date), 'dd/MM/yyyy HH:mm')}
Distribuidor: ${closing.distributorName}

Efectivo Base (Apertura): ${(opening?.cashAmount || 0).toFixed(2)}
Ventas en Efectivo: ${closing.totalSales.toFixed(2)}
Abonos Recibidos en Efectivo: ${(closing.totalPaymentsReceived || 0).toFixed(2)}
Gastos en Efectivo: ${closing.totalExpenses.toFixed(2)}
-------------------------
Total Efectivo Esperado: ${((opening?.cashAmount || 0) + closing.totalSales + (closing.totalPaymentsReceived || 0) - closing.totalExpenses).toFixed(2)}
Total Efectivo Contado: ${closing.cashCounted.toFixed(2)}
Diferencia: ${closing.difference.toFixed(2)} (${closing.difference < 0 ? "Faltante" : closing.difference > 0 ? "Sobrante" : "Cuadrado"})
-------------------------
Comentarios: ${closing.comments || 'N/A'}
        `;
        const blob = new Blob([details], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cierre_texto_${closing.id.substring(0,8)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast({ title: "Descarga Texto Iniciada", description: "El archivo de texto del cierre se está descargando."});
    };

    const handleDownloadPdf = async () => {
        try {
            await exportCashClosingToPdf(closing, opening, DENOMINATIONS);
            toast({ title: "Descarga PDF Iniciada", description: "El archivo PDF del cierre se está generando." });
        } catch (error) {
            toast({ title: "Error PDF", description: "No se pudo generar el PDF.", variant: "destructive" });
            console.error("Error generating PDF:", error);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            await exportCashClosingToExcel(closing, opening, DENOMINATIONS);
            toast({ title: "Descarga Excel Iniciada", description: "El archivo Excel del cierre se está generando." });
        } catch (error) {
            toast({ title: "Error Excel", description: "No se pudo generar el Excel.", variant: "destructive" });
            console.error("Error generating Excel:", error);
        }
    };


    return (
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="mb-3 sm:mb-0">
                    <h3 className="font-semibold text-lg text-indigo-700">{closing.distributorName}</h3>
                    <p className="text-sm text-gray-600">{format(new Date(closing.date), 'dd/MM/yyyy HH:mm')}</p>
                    <p className="text-sm text-gray-500">Efectivo Contado: <span className="font-medium text-gray-700">${closing.cashCounted.toFixed(2)}</span></p>
                    <p className={`text-sm font-bold ${closing.difference < 0 ? "text-red-600" : closing.difference > 0 ? "text-yellow-600" : "text-green-600"}`}>
                        Diferencia: ${closing.difference.toFixed(2)} {closing.difference < 0 ? "(Faltante)" : closing.difference > 0 ? "(Sobrante)" : "(Cuadrado)"}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isAdmin && (
                        <>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(closing)} title="Editar">
                            <Edit className="h-4 w-4 text-yellow-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(closing.id)} title="Eliminar">
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        </>
                    )}
                    <Button variant="outline" size="sm" onClick={handleDownloadTxt} title="Descargar TXT">
                        <Download className="mr-2 h-4 w-4" /> TXT
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadPdf} title="Descargar PDF" className="text-red-600 border-red-500 hover:bg-red-50">
                        <FileText className="mr-2 h-4 w-4" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadExcel} title="Descargar Excel" className="text-green-600 border-green-500 hover:bg-green-50">
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                    </Button>
                </div>
            </div>
            {closing.signature && <img alt="Firma del cierre de caja" className="mt-3 border rounded max-w-xs max-h-20 object-contain bg-gray-100 p-1" src={closing.signature} />}
            {closing.comments && <p className="text-xs text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">Comentarios: {closing.comments}</p>}
        </div>
    );
};

export default CashClosingListItem;
