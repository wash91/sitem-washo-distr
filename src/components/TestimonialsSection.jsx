
import React from "react";
import { motion } from "framer-motion";
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "María González",
    role: "Cliente Residencial",
    content: "El servicio de AquaPura ha sido excelente. Siempre llegan a tiempo y el agua es realmente pura y refrescante. ¡Totalmente recomendado!",
    rating: 5,
    image: "maria-gonzalez"
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Dueño de Restaurante",
    content: "Desde que contratamos a AquaPura para nuestro restaurante, nuestros clientes han notado la diferencia. El servicio es confiable y el agua es de primera calidad.",
    rating: 5,
    image: "carlos-rodriguez"
  },
  {
    id: 3,
    name: "Laura Martínez",
    role: "Gerente de Oficina",
    content: "Nuestra oficina nunca se queda sin agua gracias al sistema de entregas programadas. El personal es muy amable y profesional.",
    rating: 4,
    image: "laura-martinez"
  }
];

const TestimonialCard = ({ testimonial }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-xl shadow-lg border border-blue-100"
    >
      <div className="flex items-center mb-4">
        <div className="mr-4">
          <div className="h-12 w-12 rounded-full overflow-hidden">
            <img  alt={`Foto de ${testimonial.name}`} className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1558154839-19f6ddb31384" />
          </div>
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-gray-500">{testimonial.role}</p>
        </div>
      </div>
      
      <div className="flex mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      
      <p className="text-gray-700 italic">"{testimonial.content}"</p>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Miles de clientes confían en nosotros para mantener a sus familias y negocios hidratados con agua de la mejor calidad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
