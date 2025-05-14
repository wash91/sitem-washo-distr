
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, Calendar, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [step, setStep] = useState(1);

  if (cart.length === 0) {
    navigate("/productos");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulación de procesamiento de pago
    setTimeout(() => {
      toast({
        title: "¡Pedido realizado con éxito!",
        description: "Tu pedido ha sido procesado y será entregado pronto.",
      });
      
      clearCart();
      navigate("/pedidos");
    }, 2000);
  };

  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Finalizar Compra</h1>
        <p className="text-gray-600">
          Completa tu información para procesar tu pedido.
        </p>
      </motion.div>

      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            <Truck className="h-5 w-5" />
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            <CreditCard className="h-5 w-5" />
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? "bg-blue-500" : "bg-gray-200"}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step >= 3 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            <Check className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100"
          >
            <div className="p-6">
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold mb-6 text-gray-900">Información de Envío</h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Código Postal</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="w-full"
                      >
                        Continuar al pago
                      </Button>
                    </div>
                  </form>
                </>
              )}
              
              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold mb-6 text-gray-900">Información de Pago</h2>
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número de tarjeta</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Fecha de expiración</Label>
                        <Input
                          id="expiry"
                          name="expiry"
                          placeholder="MM/AA"
                          value={formData.expiry}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1"
                      >
                        Volver
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex-1"
                      >
                        Revisar pedido
                      </Button>
                    </div>
                  </form>
                </>
              )}
              
              {step === 3 && (
                <>
                  <h2 className="text-xl font-bold mb-6 text-gray-900">Revisar y Confirmar</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Información de Envío</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>{formData.name}</p>
                        <p>{formData.email}</p>
                        <p>{formData.phone}</p>
                        <p>{formData.address}</p>
                        <p>{formData.city}, {formData.zipCode}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Método de Pago</h3>
                      <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Tarjeta terminada en {formData.cardNumber.slice(-4)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Fecha de Entrega Estimada</h3>
                      <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                        <span>
                          {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        Volver
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Procesando...
                          </>
                        ) : (
                          "Confirmar pedido"
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 sticky top-24"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Resumen del pedido</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-50 rounded-md overflow-hidden mr-3 flex-shrink-0">
                        <img  alt={`${item.name}`} className="w-full h-full object-contain p-1" src="https://images.unsplash.com/photo-1553181393-de26d1d0dff9" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-medium">Gratis</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
