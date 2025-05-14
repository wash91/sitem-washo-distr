
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error al cargar el carrito:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Calcular el total
    const newTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Si ya existe, incrementar la cantidad
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
        };
        
        toast({
          title: "Producto actualizado",
          description: `Se ha actualizado la cantidad de ${product.name}`,
        });
        
        return updatedCart;
      } else {
        // Si no existe, añadir nuevo producto
        toast({
          title: "Producto añadido",
          description: `Se ha añadido ${product.name} al carrito`,
        });
        
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const product = prevCart.find(item => item.id === productId);
      const updatedCart = prevCart.filter((item) => item.id !== productId);
      
      if (product) {
        toast({
          title: "Producto eliminado",
          description: `Se ha eliminado ${product.name} del carrito`,
          variant: "destructive",
        });
      }
      
      return updatedCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Carrito vacío",
      description: "Se han eliminado todos los productos del carrito",
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
