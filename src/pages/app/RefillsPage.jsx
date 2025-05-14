
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Search, PackagePlus, Eye, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import RefillForm from '@/pages/app/refills/RefillForm';

const RefillRow = React.memo(({ refill, onShowReceipt }) => (
  <tr className="hover:bg-gray-50 transition-colors duration-150">
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(refill.date), 'dd/MM/yyyy HH:mm')}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refill.distributorName}</td>
    <td className="px-6 py-4 text-sm text-gray-900">
      <ul className="list-disc list-inside">
        {refill.items.map(item => <li key={item.productId}>{item.quantity}x {item.productName}</li>)}
      </ul>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${refill.totalCost?.toFixed(2) || '0.00'}</td>
    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={refill.observations}>{refill.observations || 'N/A'}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
      {refill.receiptImage ? (
        <Button variant="ghost" size="icon" onClick={() => onShowReceipt(refill.receiptImage, refill.id)}>
          <Eye className="h-5 w-5 text-blue-500" />
        </Button>
      ) : (
        <span className="text-xs text-gray-400">Sin Recibo</span>
      )}
    </td>
  </tr>
));


const RefillsPage = () => {
  const { refills, addRefill, products: allProducts } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  
  const [receiptImageToShow, setReceiptImageToShow] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentRefillId, setCurrentRefillId] = useState(null);

  const initialFormState = {
    items: [{ productId: '', quantity: 1, productName: '' }],
    observations: '',
    totalCost: 0,
    receiptImage: null,
  };
  const [newRefillData, setNewRefillData] = useState(initialFormState);

  const handleFormSubmit = useCallback((formData) => {
    addRefill(formData);
    setIsModalOpen(false);
    setNewRefillData(initialFormState);
  }, [addRefill, initialFormState]);

  const handleShowReceipt = useCallback((image, refillId) => {
    setReceiptImageToShow(image);
    setCurrentRefillId(refillId);
    setReceiptModalOpen(true);
  }, []);


  const filteredRefills = useMemo(() => {
    return refills
      .filter(refill => {
        const productMatch = filterProduct === 'all' || refill.items.some(item => item.productId === filterProduct);
        const searchMatch = searchTerm === '' || 
                            refill.items.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            refill.observations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            refill.distributorName?.toLowerCase().includes(searchTerm.toLowerCase());
        return productMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [refills, searchTerm, filterProduct]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-6 bg-gradient-to-br from-slate-50 to-sky-100 min-h-screen"
    >
      <header className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600 flex items-center">
            <PackagePlus className="mr-3 h-8 w-8" />Registro de Recargas ({filteredRefills.length})
          </h1>
          <Button 
            onClick={() => { setNewRefillData(initialFormState); setIsModalOpen(true);}} 
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Registrar Recarga
          </Button>
        </div>
      </header>

      <div className="mb-6 p-4 bg-white rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Buscar por producto, observaciones, distribuidor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-sky-300 focus:border-sky-500 focus:ring-sky-500"
            />
          </div>
          <Select value={filterProduct} onValueChange={setFilterProduct}>
            <SelectTrigger className="border-sky-300 focus:border-sky-500 focus:ring-sky-500">
              <SelectValue placeholder="Filtrar por producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Productos</SelectItem>
              {allProducts.map(product => (
                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-sky-700 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-sky-700 uppercase tracking-wider">Registrado por</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-sky-700 uppercase tracking-wider">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-sky-700 uppercase tracking-wider">Costo Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-sky-700 uppercase tracking-wider">Observaciones</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-sky-700 uppercase tracking-wider">Recibo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRefills.map(refill => (
                <RefillRow key={refill.id} refill={refill} onShowReceipt={handleShowReceipt} />
              ))}
            </tbody>
          </table>
        </div>
        {filteredRefills.length === 0 && (
          <p className="text-center py-12 text-gray-500 text-lg">
            No se encontraron recargas. Intenta ajustar tus filtros o registra una nueva recarga.
          </p>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if(!isOpen) setNewRefillData(initialFormState);
      }}>
        <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-sky-700">Registrar Nueva Recarga</DialogTitle>
            <DialogDescription>Completa los detalles de los productos comprados o ingresados a inventario.</DialogDescription>
          </DialogHeader>
          <RefillForm 
            initialData={newRefillData} 
            products={allProducts} 
            user={user} 
            onSubmit={handleFormSubmit}
            onCancel={() => {setIsModalOpen(false); setNewRefillData(initialFormState);}}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Recibo de Recarga - {currentRefillId}</DialogTitle>
          </DialogHeader>
          <div className="p-4 max-h-[80vh] overflow-auto flex justify-center items-center">
            {receiptImageToShow ? (
              <img  src={receiptImageToShow} alt={`Recibo ${currentRefillId}`} className="max-w-full max-h-[70vh] object-contain rounded-md shadow-lg" src="https://images.unsplash.com/photo-1700659393206-292ff8c0f2dc" />
            ) : (
              <p className="text-gray-500">No se pudo cargar la imagen del recibo.</p>
            )}
          </div>
          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={() => setReceiptModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default RefillsPage;
