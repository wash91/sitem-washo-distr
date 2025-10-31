import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD3rEmKtjQDdStFMhS1w-qkN_FcuFas03g",
  authDomain: "cartera-y-recaudacion.firebaseapp.com",
  projectId: "cartera-y-recaudacion",
  storageBucket: "cartera-y-recaudacion.firebasestorage.app",
  messagingSenderId: "999526404673",
  appId: "1:999526404673:web:26fbc0d1de436862a52cc0",
  measurementId: "G-JRQCMFPE6F"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

export default app;
