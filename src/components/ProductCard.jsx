
import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";

const ProductCard = ({ product }) => {
  const { id, name, description, price, image, volume, type } = product;
  const { addToCart, cart, updateQuantity } = useCart();
  
  const cartItem = cart.find(item => item.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-blue-100 hover:shadow-lg transition-shadow duration-300">
        <div className="relative pt-4 px-4">
          <div className="absolute top-6 right-6 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {volume}
          </div>
          <div className="h-48 flex items-center justify-center p-4 bg-blue-50 rounded-lg overflow-hidden">
            <img  alt={`Botella de agua ${name}`} className="h-full object-contain" src="https://images.unsplash.com/photo-1703078254373-4c1e6d3fc2b3" />
          </div>
        </div>
        
        <CardContent className="flex-grow pt-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-800">{name}</h3>
            <span className="font-bold text-blue-600">${price.toFixed(2)}</span>
          </div>
          <p className="text-gray-600 text-sm">{description}</p>
          
          <div className="mt-3 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {type}
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          {quantity > 0 ? (
            <div className="w-full flex items-center justify-between">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => updateQuantity(id, quantity - 1)}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-medium">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => addToCart(product)}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => addToCart(product)} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Añadir
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
