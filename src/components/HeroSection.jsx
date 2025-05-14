
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Droplets } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  // Animación para las burbujas
  const bubbles = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    size: Math.random() * 30 + 10,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Burbujas animadas */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="bubble"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.left,
            bottom: -100,
          }}
          animate={{
            y: [0, -500],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
          }}
        />
      ))}

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium"
            >
              <Droplets className="mr-1 h-4 w-4" />
              Agua pura, entrega rápida
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900"
            >
              Agua cristalina 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">
                directo a tu puerta
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg text-gray-600 max-w-lg"
            >
              Ofrecemos el mejor servicio de distribución de agua embotellada con entregas rápidas y programadas. Mantén a tu familia o negocio siempre hidratado.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/productos">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all">
                  Ver productos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contacto">
                <Button variant="outline" className="px-8 py-6 rounded-lg text-lg border-blue-300 text-blue-600 hover:bg-blue-50">
                  Contactar
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative z-10 water-drop">
              <img  alt="Botellas de agua purificada" className="rounded-lg shadow-2xl" src="https://images.unsplash.com/photo-1656531979259-bd7026248215" />
            </div>
            
            <motion.div
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400 rounded-full opacity-20 blur-3xl"
            />
            
            <motion.div
              animate={{
                rotate: [0, -5, 0, 5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="absolute -top-10 -left-10 w-60 h-60 bg-cyan-300 rounded-full opacity-20 blur-3xl"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
