
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Save, UserCheck, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PermissionsPage = () => {
    const { getAllUsers, allPermissions, updateUserPermissions, ROLES } = useAuth();
    const { toast } = useToast();
    
    const [distributors, setDistributors] = useState([]);
    const [selectedDistributorId, setSelectedDistributorId] = useState('');
    const [currentPermissions, setCurrentPermissions] = useState([]);

    useEffect(() => {
        const users = getAllUsers();
        setDistributors(users.filter(u => u.role === ROLES.DISTRIBUTOR));
    }, [getAllUsers, ROLES]);

    useEffect(() => {
        if (selectedDistributorId) {
            const selectedUser = distributors.find(d => d.id === selectedDistributorId);
            setCurrentPermissions(selectedUser?.permissions || []);
        } else {
            setCurrentPermissions([]);
        }
    }, [selectedDistributorId, distributors]);

    const handlePermissionChange = (permissionId, checked) => {
        setCurrentPermissions(prev => 
            checked ? [...prev, permissionId] : prev.filter(p => p !== permissionId)
        );
    };

    const handleSaveChanges = () => {
        if (!selectedDistributorId) {
            toast({ variant: "destructive", title: "Error", description: "Seleccione un distribuidor." });
            return;
        }
        updateUserPermissions(selectedDistributorId, currentPermissions);
        toast({ title: "Permisos Actualizados", description: `Los permisos para el distribuidor han sido guardados.` });
    };
    
    const distributorSpecificPermissions = allPermissions.filter(p => 
        !["manageUsers", "manageTrucks", "manageProducts", "manageOrders", "viewReports", "managePermissions", "viewAdminDashboard", "manageTruckInventoryAdmin"].includes(p.id)
    );


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto p-4"
        >
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <KeyRound className="mr-3 text-purple-600 h-8 w-8" />
                    Gestión de Permisos de Distribuidores
                </h1>
            </div>

            <Card className="mb-6 shadow-lg border-purple-200">
                <CardHeader>
                    <CardTitle>Seleccionar Distribuidor</CardTitle>
                    <CardDescription>Elija un distribuidor para ver y modificar sus accesos a los módulos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedDistributorId} onValueChange={setSelectedDistributorId}>
                        <SelectTrigger className="w-full md:w-1/2">
                            <SelectValue placeholder="Seleccione un distribuidor..." />
                        </SelectTrigger>
                        <SelectContent>
                            {distributors.map(dist => (
                                <SelectItem key={dist.id} value={dist.id}>
                                    {dist.name} ({dist.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedDistributorId ? (
                <Card className="shadow-lg border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <UserCheck className="mr-2 text-green-600 h-6 w-6"/>
                            Permisos para: {distributors.find(d => d.id === selectedDistributorId)?.name}
                        </CardTitle>
                        <CardDescription>Marque las casillas para otorgar acceso a los módulos correspondientes.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {distributorSpecificPermissions.map(permission => (
                            <div key={permission.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                                <Checkbox
                                    id={`perm-${permission.id}`}
                                    checked={currentPermissions.includes(permission.id)}
                                    onCheckedChange={(checked) => handlePermissionChange(permission.id, Boolean(checked))}
                                />
                                <Label htmlFor={`perm-${permission.id}`} className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                                    {permission.name}
                                    {permission.description && (
                                        <TooltipProvider>
                                            <Tooltip delayDuration={100}>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>{permission.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="mt-6">
                        <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-5 w-5" /> Guardar Cambios
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card className="text-center p-8 bg-gray-50 border-dashed border-gray-300">
                     <ShieldCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Por favor, seleccione un distribuidor para configurar sus permisos.</p>
                </Card>
            )}
             <Card className="mt-8 bg-yellow-50 border-yellow-300 shadow-md">
                <CardHeader className="flex flex-row items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    <CardTitle className="text-yellow-700">Nota Importante</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-yellow-600">
                        Los administradores siempre tienen acceso completo a todos los módulos y funcionalidades del sistema, independientemente de estas configuraciones.
                        Esta sección solo aplica a los permisos de los usuarios con rol de "Distribuidor".
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default PermissionsPage;
