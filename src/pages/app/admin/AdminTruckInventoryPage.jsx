
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, PackageSearch, PackageCheck, PackageX, Package as PackageIcon, Filter } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const InventoryItem = ({ item, allProducts }) => {
  const productDetails = allProducts.find(p => p.id === item.productId);
  let icon;
  let colorClass = "text-gray-700";

  switch (productDetails?.category) {
    case 'Agua':
      icon = <PackageCheck className="h-6 w-6 mr-3 text-blue-500" />;
      colorClass = "text-blue-600";
      break;
    case 'BidonVacioConLlave':
    case 'BidonVacioSinLlave':
      icon = <PackageX className="h-6 w-6 mr-3 text-orange-500" />;
      colorClass = "text-orange-600";
      break;
    default:
      icon = <PackageIcon className="h-6 w-6 mr-3 text-gray-500" />;
      colorClass = "text-gray-700";
  }

  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        {icon}
        <span className={`font-medium ${colorClass}`}>{item.productName || productDetails?.name || 'Producto Desconocido'}</span>
      </div>
      <span className={`font-bold text-lg ${colorClass}`}>{item.quantity} unidades</span>
    </div>
  );
};

const AdminTruckInventoryPage = () => {
  const { 
    getTruckInventoryForDistributor, 
    products: allProducts, 
    cashOpenings, 
    trucks, 
    distributors, 
    isDataLoaded,
    reloadAllData
  } = useData();
  const [selectedDistributorId, setSelectedDistributorId] = useState('');

  useEffect(() => {
    if (isDataLoaded) {
      reloadAllData(); 
    }
  }, [isDataLoaded, reloadAllData]);

  const currentTruckInventory = useMemo(() => {
    if (selectedDistributorId && isDataLoaded) {
      return getTruckInventoryForDistributor(selectedDistributorId);
    }
    return [];
  }, [getTruckInventoryForDistributor, selectedDistributorId, cashOpenings, isDataLoaded]);

  const activeOpening = useMemo(() => {
    if (!isDataLoaded || !selectedDistributorId) return null;
    return cashOpenings.find(op => op.distributorId === selectedDistributorId && !op.isClosed);
  }, [cashOpenings, selectedDistributorId, isDataLoaded]);

  const assignedTruck = useMemo(() => {
    if (!isDataLoaded || !activeOpening || !activeOpening.truckId) return null;
    return trucks.find(t => t.id === activeOpening.truckId);
  }, [activeOpening, trucks, isDataLoaded]);

  const { filledContainers, emptyContainers, accessories } = useMemo(() => {
    const categorized = { filledContainers: [], emptyContainers: [], accessories: [] };
    currentTruckInventory.forEach(item => {
      const productDetails = allProducts.find(p => p.id === item.productId);
      if (productDetails?.category === 'Agua') {
        categorized.filledContainers.push(item);
      } else if (productDetails?.category.startsWith('BidonVacio')) {
        categorized.emptyContainers.push(item);
      } else {
        categorized.accessories.push(item);
      }
    });
    return categorized;
  }, [currentTruckInventory, allProducts]);

  if (!isDataLoaded) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Cargando inventarios...</p>
        </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Truck className="mr-3 h-8 w-8 text-indigo-600" />Inventario de Camiones (Admin)
        </h1>
        <div className="w-full sm:w-auto">
            <Select value={selectedDistributorId} onValueChange={setSelectedDistributorId}>
                <SelectTrigger className="w-full sm:w-[280px]">
                    <Filter className="mr-2 h-4 w-4 text-gray-500 inline-block"/>
                    <SelectValue placeholder="Seleccione un distribuidor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">Ninguno seleccionado</SelectItem>
                    {distributors.map(dist => (
                        <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {!selectedDistributorId && (
        <div className="text-center py-10">
          <PackageSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Por favor, seleccione un distribuidor para ver su inventario de camión.</p>
        </div>
      )}

      {selectedDistributorId && !activeOpening && (
        <div className="text-center py-10">
          <PackageSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">El distribuidor seleccionado no tiene una apertura de caja activa.</p>
        </div>
      )}

      {selectedDistributorId && activeOpening && !assignedTruck && (
         <div className="text-center py-10">
            <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay un camión asignado a la apertura de caja actual de este distribuidor.</p>
        </div>
      )}

      {selectedDistributorId && activeOpening && assignedTruck && (
        <>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Inventario del Camión: {assignedTruck.plate} (Distribuidor: {distributors.find(d=>d.id === selectedDistributorId)?.name})</h2>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center"><PackageCheck className="mr-2 h-6 w-6 text-blue-500" /> Bidones Llenos (Agua)</CardTitle>
              <CardDescription>Productos listos para la venta.</CardDescription>
            </CardHeader>
            <CardContent>
              {filledContainers.length > 0 ? (
                <div className="space-y-3">
                  {filledContainers.map(item => <InventoryItem key={item.productId} item={item} allProducts={allProducts} />)}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No hay bidones llenos en el camión.</p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center"><PackageX className="mr-2 h-6 w-6 text-orange-500" /> Bidones Vacíos</CardTitle>
              <CardDescription>Envases retornados o disponibles.</CardDescription>
            </CardHeader>
            <CardContent>
              {emptyContainers.length > 0 ? (
                <div className="space-y-3">
                  {emptyContainers.map(item => <InventoryItem key={item.productId} item={item} allProducts={allProducts} />)}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No hay bidones vacíos registrados en el camión.</p>
              )}
            </CardContent>
          </Card>

          {accessories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><PackageIcon className="mr-2 h-6 w-6 text-gray-500" /> Accesorios y Otros</CardTitle>
                <CardDescription>Otros productos en inventario.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accessories.map(item => <InventoryItem key={item.productId} item={item} allProducts={allProducts} />)}
                </div>
              </CardContent>
            </Card>
          )}

          {currentTruckInventory.length === 0 && filledContainers.length === 0 && emptyContainers.length === 0 && accessories.length === 0 && (
             <p className="text-center text-gray-500 py-8 text-lg">El inventario del camión está completamente vacío.</p>
          )}
        </>
      )}
    </motion.div>
  );
};

export default AdminTruckInventoryPage;
