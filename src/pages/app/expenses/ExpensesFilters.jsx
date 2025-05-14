
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ExpensesFilters = ({ searchTerm, onSearchTermChange, filterCategory, onFilterCategoryChange, expenseCategories }) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Buscar gasto..." 
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            {expenseCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.name} className="capitalize">{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ExpensesFilters;
