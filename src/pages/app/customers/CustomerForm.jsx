
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import CustomerGpsHandler from '@/pages/app/customers/form-parts/CustomerGpsHandler';
import CustomerImageHandler from '@/pages/app/customers/form-parts/CustomerImageHandler';

const CustomerForm = ({ customer, onSubmit, onCancel, isDistributorView }) => {
  const { toast } = useToast();
  const initialFormState = {
    ciRuc: '',
    name: '',
    type: 'consumidor final',
    address: '',
    reference: '',
    phone: '+593',
    whatsapp: '+593',
    birthDate: '',
    gps: { lat: '', lng: '' },
    image: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        ciRuc: customer.ciRuc || '',
        name: customer.name || '',
        type: customer.type || 'consumidor final',
        address: customer.address || '',
        reference: customer.reference || '',
        phone: customer.phone || '+593',
        whatsapp: customer.whatsapp || '+593',
        birthDate: customer.birthDate || '',
        gps: customer.gps || { lat: '', lng: '' },
        image: customer.image || '',
      });
      setImagePreview(customer.image || '');
    } else {
      setFormData(initialFormState);
      setImagePreview('');
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if ((name === "phone" || name === "whatsapp")) {
        if (!value.startsWith('+')) {
             processedValue = '+593' + value.replace(/\D/g, '');
        } else {
            processedValue = '+' + value.replace(/\D/g, '');
        }
         if (value === '+') processedValue = '+593';
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleGpsFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      gps: { ...prev.gps, [fieldName]: value }
    }));
  };
  
  const handleSetCurrentLocation = (coords) => {
    setFormData(prev => ({
      ...prev,
      gps: coords
    }));
  };

  const handleImageSelected = (imageDataUrl) => {
    setImagePreview(imageDataUrl);
    setFormData(prev => ({ ...prev, image: imageDataUrl }));
  };

  const handleImageRemoved = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.ciRuc.trim()) {
      toast({ variant: "destructive", title: "Campo Requerido", description: "El CI/RUC es obligatorio." });
      return;
    }
    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Campo Requerido", description: "El Nombre es obligatorio." });
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[75vh] overflow-y-auto p-1 custom-scrollbar">
      <div>
        <Label htmlFor="ciRuc">CI / RUC <span className="text-red-500">*</span></Label>
        <Input id="ciRuc" name="ciRuc" value={formData.ciRuc} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="name">Nombre Completo / Razón Social <span className="text-red-500">*</span></Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="type">Tipo de Cliente</Label>
        <Select name="type" value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="consumidor final">Consumidor Final</SelectItem>
            <SelectItem value="negocio">Negocio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" name="address" value={formData.address} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="reference">Referencia</Label>
        <Input id="reference" name="reference" value={formData.reference} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+593..." />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} placeholder="+593..." />
        </div>
      </div>
      <div>
        <Label htmlFor="birthDate">Fecha de Nacimiento (Consumidor Final)</Label>
        <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} disabled={formData.type === 'negocio'} />
      </div>
      
      <CustomerGpsHandler 
        gps={formData.gps} 
        onGpsChange={handleGpsFieldChange}
        onGetCurrentLocation={handleSetCurrentLocation}
      />

      {!isDistributorView && (
        <CustomerImageHandler 
          imagePreview={imagePreview}
          onImageChange={handleImageSelected}
          onImageRemove={handleImageRemoved}
        />
      )}

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{customer ? 'Actualizar Cliente' : 'Agregar Cliente'}</Button>
      </DialogFooter>
    </form>
  );
};

export default CustomerForm;
