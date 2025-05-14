
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Search, Truck as TruckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useData } from '@/context/DataContext';
import { useToast } from "@/components/ui/use-toast";

const TruckForm = ({ truck, onSubmit, onCancel }) => {
  const initialFormState = { plate: '', model: '', responsible: '' };
  const [formData, setFormData] = useState(truck || initialFormState);

  useEffect(() => {
    setFormData(truck || initialFormState);
  }, [truck]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.plate || !formData.model || !formData.responsible) {
        alert("Todos los campos son requeridos."); 
        return;
    }
    onSubmit(formData);
    setFormData(initialFormState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="plate">Placa</Label>
        <Input id="plate" name="plate" value={formData.plate || ''} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="model">Modelo</Label>
        <Input id="model" name="model" value={formData.model || ''} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="responsible">Responsable</Label>
        <Input id="responsible" name="responsible" value={formData.responsible || ''} onChange={handleChange} required />
      </div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={() => { onCancel(); setFormData(initialFormState); }}>Cancelar</Button>
        <Button type="submit">{truck ? 'Actualizar' : 'Agregar'} Camión</Button>
      </DialogFooter>
    </form>
  );
};

const TrucksPage = () => {
  const { trucks, addTruck, updateTruck, deleteTruck } = useData();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrucks = useMemo(() => {
    if (!Array.isArray(trucks)) return [];
    return trucks.filter(truck =>
      (truck.plate && truck.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (truck.model && truck.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (truck.responsible && truck.responsible.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => (a.plate || '').localeCompare(b.plate || ''));
  }, [trucks, searchTerm]);

  const handleAddOrUpdateTruck = (truckData) => {
    if (!truckData.plate || !truckData.model || !truckData.responsible) {
        toast({
            variant: "destructive",
            title: "Error de validación",
            description: "Todos los campos (Placa, Modelo, Responsable) son obligatorios.",
        });
        return;
    }

    if (editingTruck) {
      updateTruck({ ...editingTruck, ...truckData });
      toast({ title: "Camión Actualizado", description: `El camión ${truckData.plate} ha sido actualizado.` });
    } else {
      addTruck(truckData);
      toast({ title: "Camión Agregado", description: `El camión ${truckData.plate} ha sido agregado.` });
    }
    setIsModalOpen(false);
    setEditingTruck(null);
  };

  const openEditModal = (truck) => {
    setEditingTruck(truck);
    setIsModalOpen(true);
  };
  
  const openAddModal = () => {
    setEditingTruck(null);
    setIsModalOpen(true);
  }

  const handleDeleteTruck = (truckId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este camión? Esta acción no se puede deshacer.")) {
      deleteTruck(truckId);
      toast({ title: "Camión Eliminado", description: "El camión ha sido eliminado." });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center"><TruckIcon className="mr-3 h-8 w-8" />Gestión de Camiones</h1>
        <Button onClick={openAddModal} className="bg-orange-500 hover:bg-orange-600">
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Camión
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) setEditingTruck(null); 
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTruck ? 'Editar' : 'Agregar'} Camión</DialogTitle>
            <DialogDescription>
              {editingTruck ? 'Modifique los detalles del camión.' : 'Ingrese los detalles del nuevo camión.'}
            </DialogDescription>
          </DialogHeader>
          <TruckForm
            truck={editingTruck}
            onSubmit={handleAddOrUpdateTruck}
            onCancel={() => { setIsModalOpen(false); setEditingTruck(null); }}
          />
        </DialogContent>
      </Dialog>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Buscar camión por placa, modelo o responsable..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTrucks.map(truck => (
              <tr key={truck.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{truck.plate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{truck.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{truck.responsible}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(truck)} title="Editar">
                    <Edit className="h-4 w-4 text-yellow-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTruck(truck.id)} title="Eliminar">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {filteredTrucks.length === 0 && (
          <p className="text-center py-8 text-gray-500">No se encontraron camiones. Pruebe agregar uno nuevo.</p>
        )}
      </div>
    </motion.div>
  );
};

export default TrucksPage;
