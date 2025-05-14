
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, User } from 'lucide-react';

const AppointmentFilters = ({
  searchTerm,
  onSearchTermChange,
  filterStatus,
  onFilterStatusChange,
  filterDistributor,
  onFilterDistributorChange,
  distributors,
  isAdmin,
}) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Buscar por cliente, distribuidor, notas..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger><Filter className="mr-2 h-4 w-4 text-gray-500 inline-block"/> <SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={filterDistributor} onValueChange={onFilterDistributorChange}>
            <SelectTrigger><User className="mr-2 h-4 w-4 text-gray-500 inline-block"/> <SelectValue placeholder="Distribuidor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Distribuidores</SelectItem>
              {distributors.map(dist => (
                <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default AppointmentFilters;
