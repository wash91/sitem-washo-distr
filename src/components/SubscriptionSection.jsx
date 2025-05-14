
import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    id: 1,
    name: "Plan Básico",
    price: 299,
    period: "mes",
    description: "Ideal para hogares pequeños",
    features: [
      "4 garrafones de 20L al mes",
      "Entrega programada mensual",
      "Calidad garantizada",
      "Atención al cliente prioritaria"
    ],
    popular: false,
    color: "from-blue-400 to-blue-600"
  },
  {
    id: 2,
    name: "Plan Familiar",
    price: 499,
    period: "mes",
    description: "Perfecto para familias",
    features: [
      "8 garrafones de 20L al mes",
      "Entregas programadas quincenales",
      "Dispensador básico incluido",
      "Calidad garantizada",
      "Atención al cliente prioritaria"
    ],
    popular: true,
    color: "from-blue-600 to-blue-800"
  },
  {
    id: 3,
    name: "Plan Empresarial",
    price: 899,
    period: "mes",
    description: "Para oficinas y negocios",
    features: [
      "16 garrafones de 20L al mes",
      "Entregas programadas semanales",
      "Dispensador premium incluido",
      "Calidad garantizada",
      "Soporte técnico 24/7",
      "Facturación electrónica"
    ],
    popular: false,
    color: "from-blue-700 to-blue-900"
  }
];

const PlanCard = ({ plan }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`relative rounded-xl overflow-hidden ${
        plan.popular ? "border-2 border-blue-500 shadow-xl" : "border border-blue-200 shadow-lg"
      }`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-bold">
          Más Popular
        </div>
      )}
      
      <div className={`bg-gradient-to-r ${plan.color} text-white p-6`}>
        <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
        <p className="text-blue-100 mb-4">{plan.description}</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">${plan.price}</span>
          <span className="text-blue-100 ml-2">/{plan.period}</span>
        </div>
      </div>
      
      <div className="p-6 bg-white">
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Link to="/contacto">
          <Button 
            className={`w-full ${
              plan.popular 
                ? "bg-blue-500 hover:bg-blue-600" 
                : "bg-white text-blue-500 border border-blue-500 hover:bg-blue-50"
            }`}
          >
            Suscribirse
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

const SubscriptionSection = () => {
  return (
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
            Planes de Suscripción
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y disfruta de agua pura sin preocupaciones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionSection;
