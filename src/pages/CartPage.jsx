
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

const CartPage = () => {
  const { cart, total, removeFromCart, updateQuantity, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="mb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500"
            >
              <ShoppingBag size={40} />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">
            Parece que aún no has añadido productos a tu carrito. Explora nuestros productos y comienza a añadirlos.
          </p>
          <Link to="/productos">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Ver productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Tu Carrito</h1>
        <p className="text-gray-600">
          Revisa tus productos y procede al pago cuando estés listo.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Productos ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Vaciar carrito
                </Button>
              </div>

              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-100 py-4 last:border-0"
                  >
                    <div className="flex items-center">
                      <div className="w-20 h-20 bg-blue-50 rounded-lg overflow-hidden mr-4">
                        <img  alt={`${item.name}`} className="w-full h-full object-contain p-2" src="https://images.unsplash.com/photo-1553531384-7e0c12f3d620" />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.volume} - {item.type}</p>
                        <p className="text-blue-600 font-medium">${item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="ml-6 text-right">
                        <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 -mr-2 mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">Gratis</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Link to="/checkout">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500">
                  Proceder al pago
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Los precios incluyen impuestos. El envío es gratuito para pedidos superiores a $200.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
