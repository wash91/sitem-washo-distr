import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'projects';

// Crear un proyecto
export const createProject = async (projectData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...projectData,
      status: projectData.status || 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creando proyecto:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todos los proyectos
export const getAllProjects = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    );
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar un proyecto
export const updateProject = async (projectId, updates) => {
  try {
    const projectRef = doc(db, COLLECTION_NAME, projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    return { success: false, error: error.message };
  }
};

// Eliminar un proyecto
export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, projectId));
    return { success: true };
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    return { success: false, error: error.message };
  }
};

// Tipos de proyectos predefinidos
export const PROJECT_TYPES = {
  TOP_DEBTORS: 'top_debtors',
  PAYMENT_AGREEMENTS: 'payment_agreements',
  OVERDUE: 'overdue',
  CUSTOM: 'custom'
};
