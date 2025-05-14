
import React from "react";
import { motion } from "framer-motion";
import { Award, Users, Droplet, Leaf, Target, TrendingUp } from 'lucide-react';

const AboutPage = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre Nosotros</h1>
            <p className="text-xl text-blue-100">
              Somos AquaPura, una empresa dedicada a llevar agua de la más alta calidad directamente a tu hogar o negocio.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Nuestra Historia</h2>
              <p className="text-gray-600 mb-4">
                AquaPura nació en 2010 con una misión clara: proporcionar agua de la más alta calidad a todos los hogares y negocios de nuestra comunidad. Lo que comenzó como una pequeña empresa familiar se ha convertido en un referente en la distribución de agua embotellada.
              </p>
              <p className="text-gray-600 mb-4">
                A lo largo de los años, hemos invertido en tecnología de punta para garantizar que cada gota de agua que distribuimos cumpla con los más altos estándares de calidad y pureza.
              </p>
              <p className="text-gray-600">
                Hoy, con más de 10,000 clientes satisfechos, seguimos comprometidos con nuestra misión original, expandiendo nuestros servicios y mejorando constantemente para ofrecerte lo mejor.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img  alt="Planta de purificación de agua" className="w-full h-auto" src="https://images.unsplash.com/photo-1687150399364-3b1a3aa6d0fc" />
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
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Nuestros Valores</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En AquaPura, nos guiamos por valores fundamentales que definen quiénes somos y cómo operamos.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <Droplet className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Calidad</h3>
              <p className="text-gray-600">
                Nos comprometemos a ofrecer agua de la más alta calidad, cumpliendo con todos los estándares de la industria.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Servicio</h3>
              <p className="text-gray-600">
                Nuestros clientes son nuestra prioridad. Nos esforzamos por brindar un servicio excepcional en cada interacción.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Sostenibilidad</h3>
              <p className="text-gray-600">
                Trabajamos constantemente para reducir nuestro impacto ambiental y promover prácticas sostenibles.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Excelencia</h3>
              <p className="text-gray-600">
                Buscamos la excelencia en todo lo que hacemos, desde la purificación hasta la entrega.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Compromiso</h3>
              <p className="text-gray-600">
                Estamos comprometidos con la salud y el bienestar de nuestros clientes y comunidades.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Innovación</h3>
              <p className="text-gray-600">
                Constantemente buscamos formas de mejorar nuestros productos y servicios a través de la innovación.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-2 md:order-1 relative"
            >
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img  alt="Equipo de AquaPura" className="w-full h-auto" src="https://images.unsplash.com/photo-1656531979259-bd7026248215" />
              </div>
              
              <motion.div
                animate={{
                  rotate: [0, -5, 0, 5, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-300 rounded-full opacity-20 blur-3xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Nuestro Equipo</h2>
              <p className="text-gray-600 mb-4">
                Detrás de cada botella de AquaPura hay un equipo dedicado de profesionales comprometidos con la excelencia. Desde nuestros técnicos de purificación hasta nuestros repartidores, cada miembro de nuestro equipo juega un papel crucial en garantizar que recibas agua de la más alta calidad.
              </p>
              <p className="text-gray-600 mb-4">
                Nuestro equipo está formado por expertos en la industria del agua, con años de experiencia y un profundo conocimiento de los procesos de purificación y distribución.
              </p>
              <p className="text-gray-600">
                Invertimos constantemente en la formación y desarrollo de nuestro personal para asegurar que estén equipados con las habilidades y conocimientos necesarios para servirte mejor.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Nuestro Compromiso</h2>
            <p className="text-xl mb-8 text-blue-100">
              En AquaPura, nos comprometemos a proporcionar agua de la más alta calidad, un servicio excepcional y prácticas sostenibles para el beneficio de nuestros clientes y el planeta.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">100%</h3>
                <p className="text-blue-100">Satisfacción garantizada</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">10,000+</h3>
                <p className="text-blue-100">Clientes satisfechos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">15+</h3>
                <p className="text-blue-100">Años de experiencia</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
