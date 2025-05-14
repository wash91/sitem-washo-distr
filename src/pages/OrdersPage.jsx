
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, ArrowRight, Calendar, Truck, CheckCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de pedidos desde localStorage
    const loadOrders = () => {
      setIsLoading(true);
      
      // Intentar cargar pedidos del localStorage
      const savedOrders = localStorage.getItem("orders");
      
      setTimeout(() => {
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          // Si no hay pedidos, crear algunos de ejemplo
          const exampleOrders = [
            {
              id: "ORD-2023-001",
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              total: 299,
              status: "entregado",
              items: [
                { id: 1, name: "Agua Purificada", quantity: 2, price: 30 },
                { id: 9, name: "Dispensador Básico", quantity: 1, price: 239 }
              ],
              address: "Av. Principal #123, Ciudad Agua, CP 12345"
            },
            {
              id: "ORD-2023-002",
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              total: 120,
              status: "en camino",
              items: [
                { id: 2, name: "Agua Mineral", quantity: 3, price: 35 },
                { id: 3, name: "Agua Alcalina", quantity: 1, price: 40 }
              ],
              address: "Calle Secundaria #456, Ciudad Agua, CP 12345"
            },
            {
              id: "ORD-2023-003",
              date: new Date().toISOString(),
              total: 450,
              status: "procesando",
              items: [
                { id: 11, name: "Dispensador Eléctrico", quantity: 1, price: 450 }
              ],
              address: "Av. Principal #123, Ciudad Agua, CP 12345"
            }
          ];
          
          setOrders(exampleOrders);
          localStorage.setItem("orders", JSON.stringify(exampleOrders));
        }
        
        setIsLoading(false);
      }, 1500);
    };
    
    loadOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "procesando":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "en camino":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "entregado":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "procesando":
        return "Procesando";
      case "en camino":
        return "En camino";
      case "entregado":
        return "Entregado";
      default:
        return "Desconocido";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "procesando":
        return "bg-yellow-100 text-yellow-800";
      case "en camino":
        return "bg-blue-100 text-blue-800";
      case "entregado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-blue-200 border-t-blue-500 rounded-full"
        />
      </div>
    );
  }

  if (orders.length === 0) {
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
              <Package size={40} />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">No tienes pedidos</h1>
          <p className="text-gray-600 mb-8">
            Aún no has realizado ningún pedido. Explora nuestros productos y realiza tu primer pedido.
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Mis Pedidos</h1>
        <p className="text-gray-600">
          Revisa el estado de tus pedidos y su historial.
        </p>
      </motion.div>

      <div className="space-y-6">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{order.id}</h2>
                  <div className="flex items-center mt-2">
                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{getStatusText(order.status)}</span>
                  </span>
                  <span className="ml-4 font-bold text-blue-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Productos</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-50 rounded-md overflow-hidden mr-3">
                          <img  alt={`${item.name}`} className="w-full h-full object-contain p-1" src="https://images.unsplash.com/photo-1553181393-de26d1d0dff9" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Dirección de entrega</h3>
                <p className="text-gray-600">{order.address}</p>
              </div>
              
              {order.status !== "entregado" && (
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    Seguir pedido
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
