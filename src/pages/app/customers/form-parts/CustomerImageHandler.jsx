
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const CustomerImageHandler = ({ imagePreview, onImageChange, onImageRemove }) => {
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleLocalImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        toast({
          variant: "destructive",
          title: "Imagen muy grande",
          description: "Por favor, seleccione una imagen de menos de 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Label>Imagen de Referencia (Casa/Negocio)</Label>
      <div className="mt-1 flex items-center gap-4">
        {imagePreview ? (
          <img-replace src={imagePreview} alt="Vista previa de referencia" className="w-20 h-20 rounded-md object-cover border" />
        ) : (
          <div className="w-20 h-20 rounded-md border flex items-center justify-center bg-gray-100">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
        )}
        <Button type="button" variant="outline" onClick={triggerImageUpload}>
          {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLocalImageChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
      </div>
      {imagePreview && (
        <Button type="button" variant="link" size="sm" className="text-red-500 px-0" onClick={onImageRemove}>
          Eliminar imagen
        </Button>
      )}
    </div>
  );
};

export default CustomerImageHandler;
