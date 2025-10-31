import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'notifications';

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  WHATSAPP: 'whatsapp'
};

// Estados de notificación
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  SCHEDULED: 'scheduled'
};

// Registrar una notificación enviada
export const logNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...notificationData,
      sentAt: Timestamp.now(),
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error registrando notificación:', error);
    return { success: false, error: error.message };
  }
};

// Registrar múltiples notificaciones
export const logMultipleNotifications = async (notificationsArray) => {
  try {
    const results = [];
    for (const notification of notificationsArray) {
      const result = await logNotification(notification);
      results.push(result);
    }
    return { success: true, results };
  } catch (error) {
    console.error('Error registrando notificaciones:', error);
    return { success: false, error: error.message };
  }
};

// Obtener historial de notificaciones
export const getNotificationHistory = async (filters = {}) => {
  try {
    let q = query(collection(db, COLLECTION_NAME), orderBy('sentAt', 'desc'));

    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters.projectId) {
      q = query(q, where('projectId', '==', filters.projectId));
    }

    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return { success: false, error: error.message };
  }
};

// Obtener estadísticas de notificaciones
export const getNotificationStats = async () => {
  try {
    const result = await getNotificationHistory();
    if (!result.success) return result;

    const notifications = result.data;

    const stats = {
      total: notifications.length,
      byType: {
        email: notifications.filter(n => n.type === NOTIFICATION_TYPES.EMAIL).length,
        whatsapp: notifications.filter(n => n.type === NOTIFICATION_TYPES.WHATSAPP).length
      },
      byStatus: {
        sent: notifications.filter(n => n.status === NOTIFICATION_STATUS.SENT).length,
        failed: notifications.filter(n => n.status === NOTIFICATION_STATUS.FAILED).length,
        pending: notifications.filter(n => n.status === NOTIFICATION_STATUS.PENDING).length
      }
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { success: false, error: error.message };
  }
};

// Preparar recordatorios de WhatsApp
export const prepareWhatsAppReminders = (debtors) => {
  return debtors.map(debtor => ({
    name: debtor.name,
    phone: debtor.phone,
    debtAmount: debtor.debtAmount,
    message: `Hola ${debtor.name}, le recordamos que tiene una deuda pendiente de $${debtor.debtAmount}. Por favor, comuníquese con nosotros para gestionar su pago.`,
    status: 'pending'
  }));
};
