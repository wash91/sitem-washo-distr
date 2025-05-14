
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="text-white"
              >
                <Droplets size={32} />
              </motion.div>
              <span className="text-2xl font-bold">AquaPura</span>
            </Link>
            <p className="text-blue-100 text-sm">
              Ofrecemos el mejor servicio de distribución de agua embotellada, garantizando pureza y calidad en cada gota.
            </p>
            <div className="flex space-x-4 pt-2">
              <motion.a
                href="#"
                whileHover={{ y: -3 }}
                className="text-blue-100 hover:text-white"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3 }}
                className="text-blue-100 hover:text-white"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3 }}
                className="text-blue-100 hover:text-white"
              >
                <Twitter size={20} />
              </motion.a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-400 pb-2">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-100 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/productos" className="text-blue-100 hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-blue-100 hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-blue-100 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-400 pb-2">
              Servicios
            </h3>
            <ul className="space-y-2">
              <li className="text-blue-100 hover:text-white transition-colors">
                Distribución a domicilio
              </li>
              <li className="text-blue-100 hover:text-white transition-colors">
                Suscripciones mensuales
              </li>
              <li className="text-blue-100 hover:text-white transition-colors">
                Servicio para empresas
              </li>
              <li className="text-blue-100 hover:text-white transition-colors">
                Dispensadores de agua
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-blue-400 pb-2">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-blue-200 mt-0.5" />
                <span className="text-blue-100">
                  Av. Principal #123, Ciudad Agua, CP 12345
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-blue-200" />
                <span className="text-blue-100">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-blue-200" />
                <span className="text-blue-100">info@aquapura.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-600 mt-8 pt-8 text-center text-blue-200 text-sm">
          <p>© {currentYear} AquaPura. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
