
import React from 'react';
import { useAuth } from "@/context/AuthContext";


export const loadDataFromLocalStorage = (key, setter, defaultValue = []) => {
    const storedData = localStorage.getItem(key);
    if (storedData) {
        try {
            setter(JSON.parse(storedData));
        } catch (e) {
            console.error(`Error parsing ${key} from localStorage`, e);
            localStorage.removeItem(key); 
            setter(defaultValue);
        }
    } else {
        setter(defaultValue);
    }
};

export const saveDataToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const initialProductDefinitions = [
  { 
    id: 'equipo_con_llave_lleno', name: 'Equipo con Llave (Bidón Lleno)', 
    category: 'EquipoLleno', purchasePrice: 2.00, consumerPrice: 5.00, businessPrice: 4.50, stock: 100, 
    isReturnableContainer: false, returnsContainerType: '', type: 'Bidón con Llave' 
  },
  { 
    id: 'equipo_sin_llave_lleno', name: 'Equipo sin Llave (Bidón Lleno)', 
    category: 'EquipoLleno', purchasePrice: 1.80, consumerPrice: 4.50, businessPrice: 4.00, stock: 100,
    isReturnableContainer: false, returnsContainerType: '', type: 'Bidón sin Llave'
  },
  { 
    id: 'recarga_con_llave', name: 'Recarga con Llave', 
    category: 'Recarga', purchasePrice: 1.00, consumerPrice: 3.00, businessPrice: 2.50, stock: 200, 
    isReturnableContainer: true, returnsContainerType: 'equipo_con_llave_vacio', type: 'Recarga con Llave'
  },
  { 
    id: 'recarga_sin_llave', name: 'Recarga sin Llave', 
    category: 'Recarga', purchasePrice: 0.90, consumerPrice: 2.80, businessPrice: 2.30, stock: 200, 
    isReturnableContainer: true, returnsContainerType: 'equipo_sin_llave_vacio', type: 'Recarga sin Llave'
  },
  { 
    id: 'paca_600ml', name: 'Pacas de 600ml (15 unidades)', 
    category: 'Paca', purchasePrice: 3.00, consumerPrice: 5.00, businessPrice: 4.50, stock: 50,
    isReturnableContainer: false, returnsContainerType: '', type: 'PET 600ml x15'
  },
  { 
    id: 'paca_1l', name: 'Pacas de 1L (8 unidades)', 
    category: 'Paca', purchasePrice: 2.50, consumerPrice: 4.50, businessPrice: 4.00, stock: 50,
    isReturnableContainer: false, returnsContainerType: '', type: 'PET 1L x8'
  },
  { 
    id: 'galon_4un', name: 'Galón (4 Unidades)', 
    category: 'Paca', purchasePrice: 4.00, consumerPrice: 6.50, businessPrice: 6.00, stock: 30,
    isReturnableContainer: false, returnsContainerType: '', type: 'PET Galón x4'
  },
  { 
    id: 'llave_accesorio', name: 'Llaves (Accesorio)', 
    category: 'Accesorio', purchasePrice: 0.50, consumerPrice: 1.50, businessPrice: 1.00, stock: 100,
    isReturnableContainer: false, returnsContainerType: '', type: 'Accesorio'
  },
  { 
    id: 'equipo_con_llave_vacio', name: 'Equipo con Llave (Bidón Vacío)', 
    category: 'EquipoVacio', purchasePrice: 0, consumerPrice: 0, businessPrice: 0, stock: 50,
    isReturnableContainer: false, returnsContainerType: '', type: 'Envase Vacío con Llave'
  },
  { 
    id: 'equipo_sin_llave_vacio', name: 'Equipo sin Llave (Bidón Vacío)', 
    category: 'EquipoVacio', purchasePrice: 0, consumerPrice: 0, businessPrice: 0, stock: 50,
    isReturnableContainer: false, returnsContainerType: '', type: 'Envase Vacío sin Llave'
  },
];


export const initialProducts = initialProductDefinitions.map(p => ({...p})); // Ensure a fresh copy

export const initialCustomers = [
    { id: 'cust1', name: 'Juan Perez', type: 'consumidor final', address: 'Calle Falsa 123', reference: 'Casa azul', phone: '+593991234567', whatsapp: '+593991234567', ciRuc: '1234567890', birthDate: '1990-01-01', gps: { lat: -2.149, lng: -79.890 }, lastVisit: null, image: '', debt: 0 },
    { id: 'cust2', name: 'Tienda La Esquina', type: 'negocio', address: 'Av. Principal y Secundaria', reference: 'Frente al parque', phone: '+593987654321', whatsapp: '+593987654321', ciRuc: '0987654321001', birthDate: null, gps: { lat: -2.155, lng: -79.895 }, lastVisit: null, image: '', debt: 0 },
];

export const initialTrucks = [
    { id: 'truck1', plate: 'GBA-1234', model: 'Chevrolet NHR', responsible: 'Admin Bijao', currentInventory: [] },
    { id: 'truck2', plate: 'PCH-5678', model: 'Kia K2700', responsible: 'Admin Bijao', currentInventory: [] },
];

// This is now primarily managed in AuthContext and DataContext gets it from there
export const initialUsersForDataContext = [ 
    // { id: "user_admin_example", name: "Admin Bijao", role: "admin", email: "admin@bijao.com" },
    // { id: "user_dist1_example", name: "Carlos Pérez", role: "distributor", email: "dist1@bijao.com" },
    // { id: "user_dist2_example", name: "Ana López", role: "distributor", email: "dist2@bijao.com" },
];
