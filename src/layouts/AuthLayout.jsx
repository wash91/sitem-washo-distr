
import React from "react";
import { Truck } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 p-4">
      <div className="flex items-center space-x-3 mb-8">
        <Truck size={48} className="text-white" />
        <h1 className="text-4xl font-bold text-white">Distribuidor Autorizado</h1>
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        {children}
      </div>
       <p className="text-center text-sm text-blue-100 mt-8">
        © {new Date().getFullYear()} Distribuidor Autorizado. Todos los derechos reservados.
      </p>
    </div>
  );
};

export default AuthLayout;
