
import React from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import SubscriptionSection from "@/components/SubscriptionSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      
      {/* Sección de productos destacados */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Nuestros Productos Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre nuestra selección de agua embotellada de la más alta calidad y accesorios para tu hogar o negocio.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-blue-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Agua Purificada</h3>
                <p className="text-gray-600 mb-4">
                  Nuestra agua purificada pasa por un riguroso proceso de filtración para garantizar su pureza.
                </p>
                <div className="h-48 rounded-lg overflow-hidden">
                  <img  alt="Garrafón de agua purificada" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1660053094665-a21094758e8b" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-blue-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Agua Mineral</h3>
                <p className="text-gray-600 mb-4">
                  Agua mineral natural con minerales esenciales para tu cuerpo, extraída de manantiales.
                </p>
                <div className="h-48 rounded-lg overflow-hidden">
                  <img  alt="Garrafón de agua mineral" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1703078254373-4c1e6d3fc2b3" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-blue-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Dispensadores</h3>
                <p className="text-gray-600 mb-4">
                  Dispensadores de agua de alta calidad para facilitar el consumo en tu hogar o negocio.
                </p>
                <div className="h-48 rounded-lg overflow-hidden">
                  <img  alt="Dispensador de agua premium" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1663253092446-c896426e7968" />
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center">
            <Link to="/productos">
              <Button className="bg-blue-500 hover:bg-blue-600">
                Ver todos los productos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <TestimonialsSection />
      <SubscriptionSection />
      
      {/* Sección CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              ¿Listo para disfrutar de agua pura?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl mb-8"
            >
              Comienza hoy mismo a recibir agua de la mejor calidad directamente en tu puerta. Proceso sencillo y entregas rápidas.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link to="/productos">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg">
                  Hacer pedido
                </Button>
              </Link>
              <Link to="/contacto">
                <Button variant="outline" className="border-white text-white hover:bg-blue-700 px-8 py-6 text-lg">
                  Contactar
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
