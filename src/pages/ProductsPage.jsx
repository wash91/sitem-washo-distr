
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import { products, productTypes } from "@/data/products";

const ProductsPage = () => {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || product.type === selectedType;
      
      return matchesSearch && matchesType;
    });
    
    setIsFiltering(true);
    
    const timer = setTimeout(() => {
      setFilteredProducts(filtered);
      setIsFiltering(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType]);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Nuestros Productos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explora nuestra amplia gama de productos de agua embotellada y accesorios para tu hogar o negocio.
          </p>
        </motion.div>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200"
              />
            </div>
            
            <div className="w-full md:w-64">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {isFiltering ? (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 border-4 border-blue-200 border-t-blue-500 rounded-full"
            />
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">
              Intenta con otra búsqueda o cambia los filtros.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
              }}
              className="mt-4"
            >
              Limpiar filtros
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
