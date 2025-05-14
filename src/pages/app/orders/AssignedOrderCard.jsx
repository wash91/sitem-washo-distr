
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, User, Phone, MapPin, DollarSign, ListChecks, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AssignedOrderCard = ({ order, onOpenSaleModal, onMarkAsCancelled }) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    const handleConfirmCancellation = () => {
        onMarkAsCancelled(order.id, cancellationReason);
        setIsCancelModalOpen(false);
        setCancellationReason('');
    };
    
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl text-blue-700">Pedido: ...{order.id.slice(-6)}</CardTitle>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {order.status === 'assigned' ? 'Asignado' : order.status}
                            </span>
                        </div>
                        <CardDescription className="text-xs text-gray-500 flex items-center pt-1">
                            <CalendarDays className="h-3 w-3 mr-1" /> Asignado: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm flex-grow">
                        <div className="font-semibold text-gray-800 flex items-center"><User className="h-4 w-4 mr-2 text-indigo-500" />{order.customerName}</div>
                        <p className="text-gray-600 flex items-start"><MapPin className="h-4 w-4 mr-2 mt-0.5 text-indigo-500 flex-shrink-0" />{order.customerAddress}</p>
                        {order.customerPhone && <p className="text-gray-600 flex items-center"><Phone className="h-4 w-4 mr-2 text-indigo-500" />{order.customerPhone}</p>}
                        
                        <div className="pt-2 border-t border-gray-200 mt-2">
                            <h4 className="font-medium text-gray-700 mb-1 flex items-center"><ListChecks className="h-4 w-4 mr-2 text-indigo-500"/>Productos:</h4>
                            <ul className="list-none space-y-1 text-xs text-gray-600 pl-1 max-h-24 overflow-y-auto">
                                {order.items.map((item, idx) => (
                                    <li key={`${item.productId}-${idx}`} className="flex justify-between">
                                        <span>{item.quantity}x {item.productName}</span>
                                        <span>${(item.quantity * parseFloat(item.price)).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-right font-bold text-lg text-blue-700 pt-1"><DollarSign className="inline h-5 w-5 mr-1" />Total: ${parseFloat(order.totalAmount).toFixed(2)}</div>
                        {order.observations && <p className="text-xs text-gray-500 italic bg-yellow-50 p-2 rounded-md">Nota: {order.observations}</p>}
                    </CardContent>
                    <CardFooter className="border-t border-gray-200 pt-4 mt-auto">
                        <div className="flex w-full justify-between items-center gap-2">
                            <Button size="sm" onClick={() => onOpenSaleModal(order)} className="bg-green-500 hover:bg-green-600 flex-1">
                                <CheckCircle className="h-4 w-4 mr-1" /> Registrar Venta
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(true)} className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 flex-1">
                                <XCircle className="h-4 w-4 mr-1" /> No Entregado
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>

            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-red-500"/>Confirmar Cancelación</DialogTitle>
                        <DialogDescription>
                            Pedido: ...{order.id.slice(-6)} para {order.customerName}.
                            Por favor, ingrese un motivo para la cancelación.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancellationReason">Motivo de la Cancelación (opcional)</Label>
                        <Input 
                            id="cancellationReason"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="Ej: Cliente no encontrado, pedido rechazado..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Cerrar</Button>
                        <Button variant="destructive" onClick={handleConfirmCancellation}>Confirmar Cancelación</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AssignedOrderCard;
