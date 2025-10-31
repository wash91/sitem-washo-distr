import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'debtors';

// Crear un deudor
export const createDebtor = async (debtorData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...debtorData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creando deudor:', error);
    return { success: false, error: error.message };
  }
};

// Crear múltiples deudores (desde Excel)
export const createMultipleDebtors = async (debtorsArray) => {
  try {
    const results = [];
    for (const debtor of debtorsArray) {
      const result = await createDebtor(debtor);
      results.push(result);
    }
    return { success: true, results };
  } catch (error) {
    console.error('Error creando deudores múltiples:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todos los deudores
export const getAllDebtors = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    );
    const debtors = [];
    querySnapshot.forEach((doc) => {
      debtors.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: debtors };
  } catch (error) {
    console.error('Error obteniendo deudores:', error);
    return { success: false, error: error.message };
  }
};

// Obtener deudores por proyecto
export const getDebtorsByProject = async (projectId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('projectId', '==', projectId)
    );
    const querySnapshot = await getDocs(q);
    const debtors = [];
    querySnapshot.forEach((doc) => {
      debtors.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: debtors };
  } catch (error) {
    console.error('Error obteniendo deudores por proyecto:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar un deudor
export const updateDebtor = async (debtorId, updates) => {
  try {
    const debtorRef = doc(db, COLLECTION_NAME, debtorId);
    await updateDoc(debtorRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error actualizando deudor:', error);
    return { success: false, error: error.message };
  }
};

// Eliminar un deudor
export const deleteDebtor = async (debtorId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, debtorId));
    return { success: true };
  } catch (error) {
    console.error('Error eliminando deudor:', error);
    return { success: false, error: error.message };
  }
};

// Obtener mayores deudores (top N)
export const getTopDebtors = async (limit = 10) => {
  try {
    const result = await getAllDebtors();
    if (!result.success) return result;

    const sortedDebtors = result.data
      .sort((a, b) => (b.debtAmount || 0) - (a.debtAmount || 0))
      .slice(0, limit);

    return { success: true, data: sortedDebtors };
  } catch (error) {
    console.error('Error obteniendo mayores deudores:', error);
    return { success: false, error: error.message };
  }
};
