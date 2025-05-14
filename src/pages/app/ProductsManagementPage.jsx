
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Search, Package, PackageCheck, PackageX, Droplets, Archive, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { initialProductDefinitions } from '@/context/dataUtils.jsx'; 

const PRODUCT_CATEGORIES_MAP = {
  EquipoLleno: { label: 'Equipo con Bidón Lleno', icon: <PackageCheck className="h-4 w-4 mr-2 text-blue-500" /> },
  EquipoVacio: { label: 'Equipo con Bidón Vacío', icon: <PackageX className="h-4 w-4 mr-2 text-orange-500" /> },
  Recarga: { label: 'Recarga (Líquido)', icon: <Droplets className="h-4 w-4 mr-2 text-green-500" /> },
  Paca: { label: 'Pacas (Botellas PET)', icon: <Archive className="h-4 w-4 mr-2 text-purple-500" /> },
  Accesorio: { label: 'Accesorio', icon: <Key className="h-4 w-4 mr-2 text-gray-500" /> },
  Otro: { label: 'Otro', icon: <Package className="h-4 w-4 mr-2 text-teal-500" /> },
};

const PRODUCT_CATEGORIES_SELECT = Object.entries(PRODUCT_CATEGORIES_MAP).map(([value, { label, icon }]) => ({ value, label, icon }));

const ProductForm = ({ product, onSubmit, onCancel, allProducts }) => {
  const getInitialFormState = (productToEdit) => {
    const baseInitialState = {
      name: '',
      category: 'Recarga',
      purchasePrice: 0,
      consumerPrice: 0,
      businessPrice: 0,
      stock: 0,
      isReturnableContainer: false,
      returnsContainerType: '', 
      type: '', 
    };

    if (productToEdit) {
      const categoryId = (typeof productToEdit.category === 'object' && productToEdit.category !== null) 
                         ? productToEdit.category.id 
                         : productToEdit.category;
      return {
        ...baseInitialState,
        ...productToEdit,
        category: categoryId || 'Recarga',
        purchasePrice: parseFloat(productToEdit.purchasePrice) || 0,
        consumerPrice: parseFloat(productToEdit.consumerPrice) || 0,
        businessPrice: parseFloat(productToEdit.businessPrice) || 0,
        stock: parseInt(productToEdit.stock, 10) || 0,
        isReturnableContainer: productToEdit.isReturnableContainer || false,
        returnsContainerType: productToEdit.returnsContainerType || '',
        type: productToEdit.type || '',
      };
    }
    return baseInitialState;
  };

  const [formData, setFormData] = useState(() => getInitialFormState(product));

  useEffect(() => {
    setFormData(getInitialFormState(product));
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;

    if (['purchasePrice', 'consumerPrice', 'businessPrice'].includes(name)) {
      processedValue = parseFloat(value) || 0;
    }
    if (name === 'stock') {
      processedValue = parseInt(value, 10) || 0;
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'category' && value === 'Recarga') {
        setFormData(prev => ({ ...prev, isReturnableContainer: true }));
    } else if (name === 'category' && value !== 'Recarga') {
        setFormData(prev => ({ ...prev, isReturnableContainer: false, returnsContainerType: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.purchasePrice < 0 || formData.consumerPrice < 0 || formData.businessPrice < 0 || formData.stock < 0) {
      alert("Nombre es requerido y los precios/stock no pueden ser negativos.");
      return;
    }
    if (formData.isReturnableContainer && !formData.returnsContainerType) {
      alert("Si el producto implica devolución de envase (ej. Recarga), debe seleccionar el tipo de envase que se retorna.");
      return;
    }
    onSubmit(formData);
  };

  const isReadOnlyStockField = ['EquipoVacio'].includes(formData.category);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
      <div>
        <Label htmlFor="name">Nombre del Producto</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
       <div>
        <Label htmlFor="type">Tipo Específico (Ej: Bidón con Llave, PET 600ml x15)</Label>
        <Input id="type" name="type" value={formData.type} onChange={handleChange} placeholder="Detalle del tipo de producto" />
      </div>
      <div>
        <Label htmlFor="category">Categoría Principal</Label>
        <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PRODUCT_CATEGORIES_SELECT.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center">{cat.icon} {cat.label}</div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="purchasePrice">Costo de Compra</Label>
        <Input id="purchasePrice" name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} step="0.01" min="0" />
      </div>
      <div>
        <Label htmlFor="consumerPrice">Precio Venta (Consumidor Final)</Label>
        <Input id="consumerPrice" name="consumerPrice" type="number" value={formData.consumerPrice} onChange={handleChange} step="0.01" min="0" />
      </div>
      <div>
        <Label htmlFor="businessPrice">Precio Venta (Negocio)</Label>
        <Input id="businessPrice" name="businessPrice" type="number" value={formData.businessPrice} onChange={handleChange} step="0.01" min="0" />
      </div>
      
      {formData.category === 'Recarga' && (
        <>
            <div className="flex items-center space-x-2 mt-2">
                <Input type="checkbox" id="isReturnableContainer" name="isReturnableContainer" checked={formData.isReturnableContainer} onChange={handleChange} className="h-4 w-4" disabled={formData.category === 'Recarga'}/>
                <Label htmlFor="isReturnableContainer">Implica devolución de envase (automático para Recargas)</Label>
            </div>
            {formData.isReturnableContainer && (
                <div>
                <Label htmlFor="returnsContainerType">Tipo de envase que se retorna</Label>
                <Select name="returnsContainerType" value={formData.returnsContainerType} onValueChange={(value) => handleSelectChange('returnsContainerType', value)}>
                    <SelectTrigger><SelectValue placeholder="Seleccione envase retornado" /></SelectTrigger>
                    <SelectContent>
                    {allProducts.filter(p => p.category === 'EquipoVacio').map(ev => (
                        <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            )}
        </>
      )}

      <div>
        <Label htmlFor="stock">Stock Actual (General)</Label>
        <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} min="0" disabled={isReadOnlyStockField}/>
        {isReadOnlyStockField && <p className="text-xs text-gray-500 mt-1">El stock de envases vacíos se gestiona automáticamente con las ventas y aperturas.</p>}
      </div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={() => { onCancel(); setFormData(getInitialFormState(null)); }}>Cancelar</Button>
        <Button type="submit">{product ? 'Actualizar' : 'Agregar'} Producto</Button>
      </DialogFooter>
    </form>
  );
};

const ProductsManagementPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof product.category === 'string' && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.type && typeof product.type === 'string' && product.type.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchTerm]);

  const handleAddOrUpdateProduct = (productData) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...productData });
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  const handleDeleteProduct = (productId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este producto? Esta acción podría afectar registros existentes.")) {
      deleteProduct(productId);
    }
  };

  const getCategoryDisplay = (categoryValue) => {
    let displayKey = categoryValue;
    let displayText = categoryValue;

    if (typeof categoryValue === 'object' && categoryValue !== null) {
      
      if (categoryValue.name) {
        displayKey = categoryValue.name;
        displayText = categoryValue.name;
      } else if (categoryValue.id) {
        displayKey = categoryValue.id; 
        displayText = categoryValue.id;
      } else {
        try {
          displayKey = JSON.stringify(categoryValue);
        } catch (e) {
          displayKey = "Invalid Category Object";
        }
        displayText = displayKey;
      }
    } else if (typeof categoryValue !== 'string') {
      displayKey = String(categoryValue);
      displayText = String(categoryValue);
    }
    
    const categoryInfo = PRODUCT_CATEGORIES_MAP[displayKey] || PRODUCT_CATEGORIES_MAP[categoryValue];
    if (categoryInfo) {
      return <div className="flex items-center">{categoryInfo.icon} {categoryInfo.label}</div>;
    }
    return displayText;
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center"><Package className="mr-3 h-8 w-8" />Gestión de Productos</h1>
        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700">
          <PlusCircle className="mr-2 h-5 w-5" /> Agregar Producto
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) setEditingProduct(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar' : 'Agregar Nuevo'} Producto</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Modifique los detalles del producto.' : 'Ingrese los detalles del nuevo producto.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={handleAddOrUpdateProduct}
            onCancel={() => { setIsModalOpen(false); setEditingProduct(null); }}
            allProducts={products}
          />
        </DialogContent>
      </Dialog>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Buscar producto por nombre, categoría o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Específico</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría Principal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Compra</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Consumidor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Negocio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Gral.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retorna Envase (ID)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.type || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCategoryDisplay(product.category)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.purchasePrice?.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.consumerPrice?.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.businessPrice?.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.isReturnableContainer ? 
                    (products.find(p=>p.id === product.returnsContainerType)?.name || product.returnsContainerType || 'Sí, tipo no especificado') 
                    : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(product)} title="Editar">
                    <Edit className="h-4 w-4 text-yellow-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} title="Eliminar">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <p className="text-center py-8 text-gray-500">No se encontraron productos. Pruebe agregar uno nuevo.</p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductsManagementPage;
