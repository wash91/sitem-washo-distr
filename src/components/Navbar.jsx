
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Truck, LogOut, LayoutDashboard, Users as UsersIcon, ShoppingCart, Users2, PackagePlus, ConciergeBell, Banknote, FileSignature, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const ROLES = {
  ADMIN: 'admin',
  DISTRIBUTOR: 'distributor',
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinksBase = [
    { name: "Ventas", path: "/ventas", icon: <ShoppingCart className="h-5 w-5" /> },
    { name: "Clientes", path: "/clientes", icon: <Users2 className="h-5 w-5" /> },
    { name: "Recargas", path: "/recargas", icon: <PackagePlus className="h-5 w-5" /> },
    { name: "Gastos", path: "/gastos", icon: <ConciergeBell className="h-5 w-5" /> },
    { name: "Apertura Caja", path: "/apertura-caja", icon: <Banknote className="h-5 w-5" /> },
    { name: "Cierre Caja", path: "/cierre-caja", icon: <FileSignature className="h-5 w-5" /> },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Usuarios", path: "/usuarios", icon: <UsersIcon className="h-5 w-5" /> },
  ];

  const getNavLinks = () => {
    if (user?.role === ROLES.ADMIN) {
      return [...navLinksBase, ...adminLinks];
    }
    return navLinksBase;
  };

  const navLinks = getNavLinks();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ rotate: 15 }}>
              <Truck size={32} className={isScrolled ? "text-blue-500" : "text-white"} />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xl font-bold ${isScrolled ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400" : "text-white"}`}
            >
              Distribuidor Autorizado
            </motion.span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-medium transition-colors flex items-center space-x-2 ${
                  location.pathname === link.path
                    ? (isScrolled ? "text-blue-600" : "text-white underline underline-offset-4")
                    : (isScrolled ? "text-gray-700 hover:text-blue-600" : "text-blue-100 hover:text-white")
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${isScrolled ? "bg-blue-600" : "bg-white"}`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
             <span className={`hidden sm:inline text-sm font-medium ${isScrolled ? "text-gray-700" : "text-blue-100"}`}>
              {user?.name} ({user?.role})
            </span>
            <Button
              variant={isScrolled ? "outline" : "ghost"}
              size="icon"
              onClick={handleLogout}
              className={`${isScrolled ? "border-red-500 text-red-500 hover:bg-red-50" : "text-red-200 hover:bg-white/10 hover:text-red-100"}`}
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Button
              variant={isScrolled ? "ghost" : "ghost"}
              size="icon"
              className={`md:hidden ${isScrolled ? "text-gray-700" : "text-white hover:bg-white/10"}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden ${isScrolled ? "bg-white border-t" : "bg-blue-600"}`}
          >
            <div className="container mx-auto px-4 py-3">
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`py-2 px-3 rounded-md flex items-center space-x-3 ${
                      location.pathname === link.path
                        ? (isScrolled ? "bg-blue-100 text-blue-600" : "bg-blue-700 text-white")
                        : (isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-blue-100 hover:bg-blue-700")
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
