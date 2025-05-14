
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const CustomerGpsHandler = ({ gps, onGpsChange, onGetCurrentLocation }) => {
  const { toast } = useToast();

  const handleLocalGpsChange = (e) => {
    const { name, value } = e.target;
    onGpsChange(name, value);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onGetCurrentLocation({ 
            lat: position.coords.latitude.toFixed(6), 
            lng: position.coords.longitude.toFixed(6) 
          });
          toast({ title: "Ubicación obtenida", description: "Coordenadas GPS actualizadas." });
        },
        (error) => {
          console.error("Error getting location: ", error);
          toast({ variant: "destructive", title: "Error de Ubicación", description: "No se pudo obtener la ubicación actual." });
        }
      );
    } else {
      toast({ variant: "destructive", title: "Geolocalización no soportada", description: "Tu navegador no soporta geolocalización." });
    }
  };

  return (
    <div className="space-y-2">
      <Label>Ubicación GPS</Label>
      <div className="flex items-center gap-2">
        <Input name="lat" placeholder="Latitud" value={gps.lat || ''} onChange={handleLocalGpsChange} />
        <Input name="lng" placeholder="Longitud" value={gps.lng || ''} onChange={handleLocalGpsChange} />
        <Button type="button" variant="outline" size="icon" onClick={handleGetCurrentLocation} title="Obtener ubicación actual">
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CustomerGpsHandler;
