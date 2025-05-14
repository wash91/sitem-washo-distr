
import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import ContactForm from "@/components/ContactForm";

const ContactPage = () => {
  return (
    <div>
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contáctanos</h1>
            <p className="text-xl text-blue-100">
              Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta o solicitud.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Información de Contacto</h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Dirección</h3>
                    <p className="text-gray-600">
                      Av. Principal #123<br />
                      Ciudad Agua, CP 12345<br />
                      México
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Teléfono</h3>
                    <p className="text-gray-600">
                      +1 (555) 123-4567<br />
                      +1 (555) 987-6543
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Correo Electrónico</h3>
                    <p className="text-gray-600">
                      info@aquapura.com<br />
                      ventas@aquapura.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Horario de Atención</h3>
                    <p className="text-gray-600">
                      Lunes a Viernes: 8:00 AM - 6:00 PM<br />
                      Sábados: 9:00 AM - 2:00 PM<br />
                      Domingos: Cerrado
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl overflow-hidden shadow-lg h-64 md:h-80">
                <img  alt="Mapa de ubicación de AquaPura" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1660053094665-a21094758e8b" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Aquí encontrarás respuestas a las preguntas más comunes sobre nuestros servicios.
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md mb-4"
            >
              <h3 className="font-bold text-gray-900 mb-2">¿Cuál es el área de cobertura para entregas?</h3>
              <p className="text-gray-600">
                Actualmente cubrimos toda el área metropolitana de Ciudad Agua y algunas zonas aledañas. Puedes verificar si tu ubicación está dentro de nuestra área de cobertura contactándonos directamente.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md mb-4"
            >
              <h3 className="font-bold text-gray-900 mb-2">¿Cuánto tiempo tarda en llegar mi pedido?</h3>
              <p className="text-gray-600">
                Para pedidos regulares, realizamos entregas dentro de las 24-48 horas siguientes. Para pedidos urgentes, ofrecemos un servicio express con entrega en el mismo día (sujeto a disponibilidad y con costo adicional).
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md mb-4"
            >
              <h3 className="font-bold text-gray-900 mb-2">¿Cómo puedo programar entregas recurrentes?</h3>
              <p className="text-gray-600">
                Puedes suscribirte a nuestros planes mensuales o quincenales a través de nuestra página web o contactando directamente con nuestro servicio al cliente. Te ofrecemos flexibilidad para ajustar las fechas y cantidades según tus necesidades.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <h3 className="font-bold text-gray-900 mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-gray-600">
                Aceptamos efectivo, tarjetas de crédito/débito, transferencias bancarias y pagos a través de aplicaciones móviles. Para suscripciones, recomendamos configurar pagos automáticos para mayor comodidad.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
