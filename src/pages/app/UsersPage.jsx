
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Search, UserCog, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";

const UsersPage = () => {
  const { ROLES, addUser, updateUser, deleteUser, getAllUsers, user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [usersList, setUsersList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ name: '', email: '', role: ROLES.DISTRIBUTOR, password: '' });

  useEffect(() => {
    setUsersList(getAllUsers());
  }, [getAllUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      const updatedData = { ...formData };
      if (!formData.password) {
        delete updatedData.password; 
      }
      updateUser(editingUser.id, updatedData);
      toast({ title: "Usuario Actualizado", description: `${formData.name} ha sido actualizado.`});
    } else {
      if (!formData.password) {
        toast({title: "Error", description: "La contraseña es requerida para nuevos usuarios.", variant: "destructive"});
        return;
      }
      addUser(formData);
      toast({ title: "Usuario Agregado", description: `${formData.name} ha sido agregado.`});
    }
    setUsersList(getAllUsers()); 
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: ROLES.DISTRIBUTOR, password: '' });
  };
  
  const openEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({ name: userToEdit.name, email: userToEdit.email, role: userToEdit.role, password: '' });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: ROLES.DISTRIBUTOR, password: '' });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userIdToDelete) => {
    if (currentUser && currentUser.id === userIdToDelete) {
        toast({ title: "Acción no permitida", description: "No puedes eliminar tu propia cuenta.", variant: "destructive"});
        return;
    }
    
    const userToDelete = usersList.find(u => u.id === userIdToDelete);
    if (userToDelete) {
        const confirmDelete = window.confirm(`¿Está seguro de que desea eliminar al usuario "${userToDelete.name}"? Esta acción no se puede deshacer.`);
        if (confirmDelete) {
            deleteUser(userIdToDelete);
            setUsersList(getAllUsers());
            toast({ title: "Usuario Eliminado", description: `El usuario "${userToDelete.name}" ha sido eliminado.`, variant: "destructive"});
        }
    }
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [usersList, searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <Button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-700">
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Usuario
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar' : 'Agregar'} Usuario</DialogTitle>
            <DialogDescription>
              {editingUser ? `Modificando datos para ${editingUser.name}.` : 'Creando un nuevo usuario en el sistema.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="password">{editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder={editingUser ? "Dejar en blanco para no cambiar" : ""} required={!editingUser} />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select name="role" value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={ROLES.DISTRIBUTOR}>Distribuidor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingUser ? 'Actualizar' : 'Agregar'} Usuario</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Buscar usuario por nombre, correo o rol..." 
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(userItem => (
              <tr key={userItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userItem.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userItem.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                    userItem.role === ROLES.ADMIN ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userItem.role === ROLES.ADMIN ? <ShieldCheck className="mr-1 h-4 w-4"/> : <UserCog className="mr-1 h-4 w-4"/>}
                    {userItem.role === ROLES.ADMIN ? 'Administrador' : 'Distribuidor'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(userItem)} title="Editar">
                    <Edit className="h-4 w-4 text-yellow-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(userItem.id)} title="Eliminar" disabled={currentUser && currentUser.id === userItem.id}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {filteredUsers.length === 0 && (
          <p className="text-center py-8 text-gray-500">No se encontraron usuarios.</p>
        )}
      </div>
    </motion.div>
  );
};

export default UsersPage;
