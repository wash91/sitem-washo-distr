
import React from "react";
import { motion } from "framer-motion";
import { Truck, Clock, Droplet, Shield, Recycle, CreditCard } from 'lucide-react';

const features = [
  {
    icon: <Truck className="h-10 w-10" />,
    title: "Entrega a Domicilio",
    description: "Llevamos el agua directamente a tu hogar o negocio sin costo adicional.",
  },
  {
    icon: <Clock className="h-10 w-10" />,
    title: "Entregas Programadas",
    description: "Programa tus entregas semanales o mensuales y nunca te quedes sin agua.",
  },
  {
    icon: <Droplet className="h-10 w-10" />,
    title: "Agua 100% Purificada",
    description: "Nuestro proceso de purificación garantiza la mejor calidad en cada gota.",
  },
  {
    icon: <Shield className="h-10 w-10" />,
    title: "Calidad Garantizada",
    description: "Cumplimos con todos los estándares de calidad y seguridad alimentaria.",
  },
  {
    icon: <Recycle className="h-10 w-10" />,
    title: "Compromiso Ecológico",
    description: "Reciclamos todos nuestros envases para cuidar el medio ambiente.",
  },
  {
    icon: <CreditCard className="h-10 w-10" />,
    title: "Múltiples Formas de Pago",
    description: "Aceptamos efectivo, tarjetas y transferencias para tu comodidad.",
  },
];

const FeatureCard = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-blue-100"
    >
      <div className="mb-4 text-blue-500">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            ¿Por qué elegir <span className="text-blue-600">AquaPura</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Ofrecemos el mejor servicio de distribución de agua embotellada con múltiples beneficios para ti.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
