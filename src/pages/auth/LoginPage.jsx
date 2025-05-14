
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, AlertTriangle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await login(email, password);

    if (result && result.success) {
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "Bienvenido de nuevo.",
      });
      navigate("/"); 
    } else {
      let description = "Ocurrió un error inesperado. Por favor, intenta de nuevo.";
      if (result && result.error) {
        if (result.error.toLowerCase().includes("invalid login credentials")) {
          description = "Credenciales inválidas. Por favor, verifica tu correo y contraseña.";
        } else if (result.error.toLowerCase().includes("profile not found")) {
          description = "Usuario encontrado, pero el perfil no está configurado. Contacta al administrador.";
        } else if (result.error.toLowerCase().includes("database error querying schema") || result.error.toLowerCase().includes("unexpected_failure")) {
          description = "Error de base de datos al intentar iniciar sesión. Por favor, contacta al soporte técnico o intenta más tarde.";
        } else {
          description = result.error;
        }
      }
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: description,
        action: <AlertTriangle className="h-5 w-5 text-white" />,
      });
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        Iniciar Sesión
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            aria-label="Correo Electrónico"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
            aria-label="Contraseña"
          />
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white" disabled={isLoading}>
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
       <p className="text-center text-xs text-gray-500 mt-6">
        Acceso exclusivo para personal autorizado de Distribuidor Autorizado.
      </p>
    </motion.div>
  );
};

export default LoginPage;
