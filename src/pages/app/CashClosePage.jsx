
import React, { useState, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";

const CashClosingForm = React.lazy(() => import('./cash-close/CashClosingForm'));
const CashClosingListItem = React.lazy(() => import('./cash-close/CashClosingListItem'));

const LoadingFallback = () => <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

const CashClosePage = () => {
  const { cashClosings, addCashClosing, updateCashClosing, deleteCashClosing, sales, expenses, cashOpenings, distributors, accountsReceivable } = useData();
  const { user, ROLES } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClosing, setEditingClosing] = useState(null);
  
  const isAdmin = user?.role === ROLES.ADMIN;

  const handleFormSubmit = (data) => {
    if(editingClosing) {
        updateCashClosing({...editingClosing, ...data});
        toast({ title: "Cierre Actualizado", description: "El cierre de caja ha sido actualizado." });
    } else {
        addCashClosing(data);
        toast({ title: "Cierre Registrado", description: "El nuevo cierre de caja ha sido registrado." });
    }
    setIsModalOpen(false);
    setEditingClosing(null);
  };

  const openEditModal = (closing) => {
    setEditingClosing(closing);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingClosing(null);
    setIsModalOpen(true);
  };

  const handleDelete = (closingId) => {
     if(window.confirm("¿Está seguro que desea eliminar este cierre de caja? Esta acción no se puede deshacer.")) {
        deleteCashClosing(closingId);
        toast({ title: "Cierre Eliminado", description: "El cierre de caja ha sido eliminado.", variant: "destructive" });
    }
  };
  
  const filteredClosings = useMemo(() => {
    return cashClosings
      .filter(closing => isAdmin || closing.distributorId === user?.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [cashClosings, user, isAdmin]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Cierre de Caja</h1>
        <Button onClick={openAddModal} className="bg-purple-600 hover:bg-purple-700">
            <PlusCircle className="mr-2 h-5 w-5" /> Registrar Cierre
        </Button>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) setEditingClosing(null);
      }}>
        <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClosing ? 'Editar' : 'Registrar'} Cierre de Caja</DialogTitle>
            <DialogDescription>Resumen y firma al finalizar el día. Ingrese el desglose del efectivo contado.</DialogDescription>
          </DialogHeader>
          <Suspense fallback={<LoadingFallback />}>
            <CashClosingForm
                onSubmit={handleFormSubmit}
                onCancel={() => { setIsModalOpen(false); setEditingClosing(null);}}
                initialData={editingClosing}
                userCashOpenings={cashOpenings}
                sales={sales}
                expenses={expenses}
                accountsReceivable={accountsReceivable}
                isAdmin={isAdmin}
                distributors={distributors}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
      
      <div className="space-y-4">
        {filteredClosings.map(closing => (
            <Suspense fallback={<LoadingFallback />} key={closing.id}>
                <CashClosingListItem
                    closing={closing}
                    isAdmin={isAdmin}
                    cashOpenings={cashOpenings}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                />
            </Suspense>
        ))}
        {filteredClosings.length === 0 && (
          <p className="text-center py-8 text-gray-500">No se encontraron cierres de caja.</p>
        )}
      </div>
    </motion.div>
  );
};

export default CashClosePage;
