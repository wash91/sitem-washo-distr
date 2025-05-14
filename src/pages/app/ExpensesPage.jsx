
import React, { useState, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

const ExpenseForm = React.lazy(() => import('./expenses/ExpenseForm'));
const CategoryManager = React.lazy(() => import('./expenses/CategoryManager'));
const ExpensesFilters = React.lazy(() => import('./expenses/ExpensesFilters'));
const ExpensesTable = React.lazy(() => import('./expenses/ExpensesTable'));

const LoadingFallback = ({height = "h-32"}) => <div className={`flex justify-center items-center ${height}`}><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;


const ExpensesPage = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory: dataDeleteExpenseCategory, distributors } = useData();
  const { user, ROLES } = useAuth();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const isAdmin = user?.role === ROLES.ADMIN;

  const handleExpenseFormSubmit = (data) => {
    if (editingExpense) {
        updateExpense(editingExpense.id, {...editingExpense, ...data});
    } else {
        addExpense(data);
    }
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const openEditExpenseModal = (expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };
  
  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = (expenseId) => {
    if(window.confirm("¿Está seguro que desea eliminar este gasto?")) {
        deleteExpense(expenseId);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        const categoryMatch = filterCategory === 'all' || expense.category === filterCategory;
        const searchMatch = searchTerm === '' || 
                            expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.observations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            expense.distributorName?.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = isAdmin || expense.distributorId === user?.id;
        return categoryMatch && searchMatch && roleMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, searchTerm, filterCategory, user, isAdmin]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Registro de Gastos</h1>
        <div className="flex gap-2">
            {isAdmin && (
                 <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="text-purple-600 border-purple-500 hover:bg-purple-50">
                            <ListPlus className="mr-2 h-5 w-5" /> Gestionar Categorías
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <Suspense fallback={<LoadingFallback />}>
                            <CategoryManager 
                                categories={expenseCategories} 
                                onAdd={addExpenseCategory}
                                onUpdate={updateExpenseCategory} 
                                onDelete={dataDeleteExpenseCategory}
                            />
                        </Suspense>
                    </DialogContent>
                </Dialog>
            )}
            <Button onClick={openAddExpenseModal} className="bg-red-600 hover:bg-red-700">
                <PlusCircle className="mr-2 h-5 w-5" /> Registrar Gasto
            </Button>
        </div>
      </div>

      <Dialog open={isExpenseModalOpen} onOpenChange={(isOpen) => {
          setIsExpenseModalOpen(isOpen);
          if(!isOpen) setEditingExpense(null);
      }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Editar' : 'Registrar Nuevo'} Gasto</DialogTitle>
              <DialogDescription>Egresos diarios.</DialogDescription>
            </DialogHeader>
            <Suspense fallback={<LoadingFallback />}>
                <ExpenseForm
                    onSubmit={handleExpenseFormSubmit}
                    onCancel={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }}
                    initialData={editingExpense}
                    expenseCategories={expenseCategories}
                    isAdmin={isAdmin}
                    distributors={distributors}
                />
            </Suspense>
          </DialogContent>
        </Dialog>
      
      <Suspense fallback={<LoadingFallback height="h-24"/>}>
        <ExpensesFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            expenseCategories={expenseCategories}
        />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback height="h-64"/>}>
        <ExpensesTable
            expenses={filteredExpenses}
            isAdmin={isAdmin}
            currentUser={user}
            onEdit={openEditExpenseModal}
            onDelete={handleDeleteExpense}
        />
      </Suspense>
    </motion.div>
  );
};

export default ExpensesPage;
