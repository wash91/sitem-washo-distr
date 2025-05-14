
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Search, Trash2, PackagePlus as PackagePlusIcon, Edit, Download, PackageX, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

const CashOpeningFormProducts = ({ productsDelivered, allProducts, onProductChange, onAddProduct, onRemoveProduct }) => (
  <div className="space-y-2">
    <Label>Productos Cargados al Camión (Llenos y Vacíos)</Label>
    {productsDelivered.map((prod, index) => {
      const selectedProductInfo = allProducts.find(p => p.id === prod.productId);
      const isContainer = selectedProductInfo?.category.startsWith('BidonVacio');
      return (
        <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
          <Select value={prod.productId} onValueChange={(value) => onProductChange(index, 'productId', value)}>
            <SelectTrigger className="flex-grow"><SelectValue placeholder="Producto" /></SelectTrigger>
            <SelectContent>
              {allProducts.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center">
                    {p.category === 'Agua' ? <PackageCheck className="h-4 w-4 mr-2 text-green-500" /> : p.category.startsWith('BidonVacio') ? <PackageX className="h-4 w-4 mr-2 text-orange-500" /> : <PackagePlusIcon className="h-4 w-4 mr-2 text-gray-500" />}
                    {p.name} (Stock Gral: {p.stock})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" value={prod.quantity} onChange={(e) => onProductChange(index, 'quantity', parseInt(e.target.value, 10))} min="0" className="w-20"/>
          <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveProduct(index)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      );
    })}
    <Button type="button" variant="outline" onClick={onAddProduct} className="w-full">
      <PackagePlusIcon className="mr-2 h-4 w-4" /> Agregar Producto/Envase
    </Button>
  </div>
);

const CashOpeningForm = ({ onSubmit, onCancel, initialData, allProducts, trucks, distributors, isAdmin }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const defaultState = useMemo(() => ({
    distributorId: isAdmin ? '' : currentUser?.id,
    distributorName: isAdmin ? '' : currentUser?.name,
    cashAmount: '',
    truckId: '',
    productsDelivered: [], 
    observations: '',
    date: new Date().toISOString()
  }), [isAdmin, currentUser]);

  const [openingData, setOpeningData] = useState(initialData ? 
    {...initialData, cashAmount: initialData.cashAmount.toString(), date: initialData.date || new Date().toISOString()} 
    : defaultState
  );
  
  useEffect(() => {
      if (initialData) {
          setOpeningData({...initialData, cashAmount: initialData.cashAmount.toString(), date: initialData.date || new Date().toISOString()});
      } else {
          setOpeningData(defaultState);
      }
  }, [initialData, defaultState]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOpeningData(prev => ({ ...prev, [name]: value }));
  };

  const handleDistributorChange = (distributorId) => {
    const selectedDistributor = distributors.find(d => d.id === distributorId);
    setOpeningData(prev => ({ 
        ...prev, 
        distributorId: selectedDistributor?.id || '',
        distributorName: selectedDistributor?.name || ''
    }));
  };

  const handleProductDeliveredChange = (index, field, value) => {
    const updatedProducts = [...openingData.productsDelivered];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    if (field === 'productId') {
        const product = allProducts.find(p => p.id === value);
        updatedProducts[index].productName = product ? product.name : '';
        updatedProducts[index].category = product ? product.category : '';
    }
    if (field === 'quantity' && value < 0) updatedProducts[index].quantity = 0;
    setOpeningData(prev => ({ ...prev, productsDelivered: updatedProducts }));
  };

  const addProductToDelivered = () => {
    setOpeningData(prev => ({
      ...prev,
      productsDelivered: [...prev.productsDelivered, { productId: '', quantity: 1, productName: '', category: '' }]
    }));
  };

  const removeProductFromDelivered = (index) => {
    const updatedProducts = openingData.productsDelivered.filter((_, i) => i !== index);
    setOpeningData(prev => ({ ...prev, productsDelivered: updatedProducts }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!openingData.distributorId && isAdmin) {
        toast({ variant: "destructive", title: "Error", description: "Por favor seleccione un distribuidor." });
        return;
    }
    if (openingData.cashAmount === '' || parseFloat(openingData.cashAmount) < 0) {
        toast({ variant: "destructive", title: "Error", description: "Por favor ingrese un valor en efectivo válido." });
        return;
    }
    if (!openingData.truckId) {
        toast({ variant: "destructive", title: "Error", description: "Por favor seleccione un camión." });
        return;
    }
    const productsToSubmit = openingData.productsDelivered
        .filter(p => p.productId && p.quantity > 0)
        .map(p => ({ 
            productId: p.productId, 
            quantity: parseInt(p.quantity, 10), 
            productName: allProducts.find(ap => ap.id === p.productId)?.name || p.productName,
            category: allProducts.find(ap => ap.id === p.productId)?.category || p.category,
        }));

    onSubmit({
        ...openingData, 
        cashAmount: parseFloat(openingData.cashAmount),
        productsDelivered: productsToSubmit
    });
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
      <div>
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" type="text" value={format(new Date(openingData.date || Date.now()), 'dd/MM/yyyy HH:mm')} disabled />
      </div>
      {isAdmin ? (
        <div>
          <Label htmlFor="distributorId">Distribuidor Asignado</Label>
          <Select name="distributorId" value={openingData.distributorId} onValueChange={handleDistributorChange}>
            <SelectTrigger><SelectValue placeholder="Seleccione un distribuidor" /></SelectTrigger>
            <SelectContent>
              {distributors.map(dist => (
                <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div>
          <Label htmlFor="distributorName">Distribuidor</Label>
          <Input id="distributorName" type="text" value={openingData.distributorName || currentUser?.name} disabled />
        </div>
      )}
      <div>
        <Label htmlFor="truckId">Camión Asignado</Label>
        <Select name="truckId" value={openingData.truckId} onValueChange={(value) => setOpeningData(prev => ({...prev, truckId: value}))}>
          <SelectTrigger><SelectValue placeholder="Seleccione un camión" /></SelectTrigger>
          <SelectContent>
            {trucks.map(truck => (
              <SelectItem key={truck.id} value={truck.id}>{truck.plate} - {truck.model}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="cashAmount">Valor en Efectivo Entregado</Label>
        <Input id="cashAmount" name="cashAmount" type="number" value={openingData.cashAmount} onChange={handleInputChange} step="0.01" min="0" />
      </div>
      
      <CashOpeningFormProducts 
        productsDelivered={openingData.productsDelivered}
        allProducts={allProducts}
        onProductChange={handleProductDeliveredChange}
        onAddProduct={addProductToDelivered}
        onRemoveProduct={removeProductFromDelivered}
      />

      <div>
        <Label htmlFor="observations">Observaciones</Label>
        <textarea id="observations" name="observations" value={openingData.observations} onChange={handleInputChange} className="w-full p-2 border rounded-md" rows="3"></textarea>
      </div>
      <DialogFooter className="pt-4 border-t mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{initialData ? 'Actualizar' : 'Guardar'} Apertura</Button>
      </DialogFooter>
    </form>
  );
};


const CashOpenPage = () => {
  const { cashOpenings, addCashOpening, updateCashOpening, deleteCashOpening, products: allProducts, trucks, distributors, isDataLoaded, reloadAllData } = useData();
  const { user, ROLES } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpening, setEditingOpening] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isAdmin = user?.role === ROLES.ADMIN;

  useEffect(() => {
    if (isDataLoaded && document.visibilityState === 'visible') {
      reloadAllData();
    }
  }, [isDataLoaded, reloadAllData]);

  const handleFormSubmit = (data) => {
    if (editingOpening) {
        updateCashOpening({...editingOpening, ...data});
    } else {
        addCashOpening(data);
    }
    setIsModalOpen(false);
    setEditingOpening(null);
  };

  const openEditModal = (opening) => {
    setEditingOpening(opening);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingOpening(null);
    setIsModalOpen(true);
  };

  const handleDelete = (openingId) => {
    if(window.confirm("¿Está seguro que desea eliminar esta apertura de caja? Esta acción no se puede deshacer.")) {
        deleteCashOpening(openingId);
    }
  };
  
  const handleDownload = (opening) => {
    const truckDetails = trucks.find(t => t.id === opening.truckId);
    const details = `
      APERTURA DE CAJA
      -------------------------
      ID: ${opening.id}
      Fecha: ${format(new Date(opening.date), 'dd/MM/yyyy HH:mm')}
      Distribuidor: ${opening.distributorName}
      Camión: ${truckDetails ? `${truckDetails.plate} (${truckDetails.model})` : 'N/A'}
      Efectivo Entregado: $${opening.cashAmount.toFixed(2)}
      Observaciones: ${opening.observations || 'N/A'}

      Productos/Envases Cargados:
      ${opening.productsDelivered.map(p => `  - ${p.quantity}x ${p.productName || allProducts.find(ap => ap.id === p.productId)?.name || 'Desconocido'} (${p.category})`).join('\n')}
      -------------------------
      Creado por: ${opening.createdBy || 'Sistema'}
    `;
    console.log("Descargando detalles de apertura:", details);
    toast({ title: "Descarga Simulada", description: "Los detalles de la apertura se han mostrado en la consola."});

    const blob = new Blob([details], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `apertura_${opening.id.substring(opening.id.length-5)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const filteredOpenings = useMemo(() => {
    if (!isDataLoaded) return [];
    return cashOpenings
      .filter(opening => {
        const searchMatch = searchTerm === '' || 
                            opening.distributorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (trucks.find(t => t.id === opening.truckId)?.plate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            opening.observations?.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = isAdmin || opening.distributorId === user?.id;
        return searchMatch && roleMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [cashOpenings, searchTerm, user, trucks, isAdmin, isDataLoaded]);

  if (!isDataLoaded) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Cargando datos de aperturas...</p>
        </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.20))]"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Apertura de Caja</h1>
        {(isAdmin || user?.permissions?.includes("manageCashOpenings")) && (
          <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Registrar Apertura
          </Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) setEditingOpening(null);
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{editingOpening ? 'Editar' : 'Registrar'} Apertura de Caja</DialogTitle>
            <DialogDescription>Dinero y productos/envases entregados al distribuidor.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto px-6 custom-scrollbar">
            <CashOpeningForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setIsModalOpen(false); setEditingOpening(null); }}
              initialData={editingOpening}
              allProducts={allProducts}
              trucks={trucks}
              distributors={distributors}
              isAdmin={isAdmin}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Buscar apertura por distribuidor, placa o observaciones..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
      </div>
      
      <div className="flex-grow bg-white rounded-lg shadow overflow-y-auto custom-scrollbar">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuidor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Camión</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efectivo Entregado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos/Envases Cargados</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOpenings.map(opening => {
              const truck = trucks.find(t => t.id === opening.truckId);
              const productsSummary = opening.productsDelivered?.map(p => {
                const productInfo = allProducts.find(ap => ap.id === p.productId);
                let icon = <PackagePlusIcon className="h-3 w-3 mr-1 text-gray-400 inline-block" />;
                if (productInfo?.category === 'Agua') icon = <PackageCheck className="h-3 w-3 mr-1 text-green-400 inline-block" />;
                else if (productInfo?.category?.startsWith('BidonVacio')) icon = <PackageX className="h-3 w-3 mr-1 text-orange-400 inline-block" />;
                return `${icon}${p.quantity}x ${p.productName || productInfo?.name || 'Desconocido'}`;
              }).join('; ') || 'N/A';
              return (
                <tr key={opening.id} className={`hover:bg-gray-50 ${opening.isClosed ? 'bg-gray-100 opacity-70' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(opening.date), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{opening.distributorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{truck ? `${truck.plate} (${truck.model})` : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${opening.cashAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="truncate" title={opening.productsDelivered?.map(p => `${p.quantity}x ${p.productName || allProducts.find(ap => ap.id === p.productId)?.name || 'Desconocido'} (${p.category})`).join(', ')}>
                      {opening.productsDelivered?.slice(0,2).map((p, idx) => {
                         const productInfo = allProducts.find(ap => ap.id === p.productId);
                         let icon = <PackagePlusIcon className="h-3 w-3 mr-1 text-gray-400 inline-block" />;
                         if (productInfo?.category === 'Agua') icon = <PackageCheck className="h-3 w-3 mr-1 text-green-400 inline-block" />;
                         else if (productInfo?.category?.startsWith('BidonVacio')) icon = <PackageX className="h-3 w-3 mr-1 text-orange-400 inline-block" />;
                         return <span key={idx} className="mr-2">{icon}{p.quantity}x {p.productName || productInfo?.name || 'Desconocido'}</span>
                      })}
                      {opening.productsDelivered?.length > 2 && "..."}
                    </div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${opening.isClosed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {opening.isClosed ? 'Cerrada' : 'Abierta'}
                     </span>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(opening)} title="Editar" disabled={opening.isClosed}>
                          <Edit className="h-4 w-4 text-yellow-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(opening.id)} title="Eliminar">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(opening)} title="Descargar Detalles">
                      <Download className="h-4 w-4 text-blue-500" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
         {filteredOpenings.length === 0 && (
          <p className="text-center py-8 text-gray-500">No se encontraron aperturas de caja.</p>
        )}
      </div>
    </motion.div>
  );
};

export default CashOpenPage;
