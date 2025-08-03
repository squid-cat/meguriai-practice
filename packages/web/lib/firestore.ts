import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface LeaveNote {
  id?: string;
  title: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  userId: string;
  checklist: ChecklistItem[];
  emergencyContacts: EmergencyContact[];
  requests: RequestItem[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  sharedWith?: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface RequestItem {
  id: string;
  person: string;
  request: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Reflection {
  id?: string;
  noteId: string;
  userId: string;
  whatWorked: string;
  whatDidntWork: string;
  improvements: string;
  nextTimeReminder: string;
  createdAt?: Timestamp;
}

// LeaveNote operations
export const saveLeaveNote = async (note: Omit<LeaveNote, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'leaveNotes'), {
      ...note,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      sharedWith: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

export const updateLeaveNote = async (id: string, updates: Partial<LeaveNote>) => {
  try {
    const noteRef = doc(db, 'leaveNotes', id);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteLeaveNote = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'leaveNotes', id));
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const getUserLeaveNotes = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'leaveNotes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LeaveNote[];
  } catch (error) {
    console.error('Error getting user notes:', error);
    return [];
  }
};

export const getLeaveNoteById = async (id: string) => {
  try {
    const docRef = doc(db, 'leaveNotes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LeaveNote;
    }
    return null;
  } catch (error) {
    console.error('Error getting note:', error);
    return null;
  }
};

// Real-time listener for user's notes
export const subscribeToUserNotes = (userId: string, callback: (notes: LeaveNote[]) => void) => {
  const q = query(
    collection(db, 'leaveNotes'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LeaveNote[];
    callback(notes);
  });
};

// Reflection operations
export const saveReflection = async (reflection: Omit<Reflection, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'reflections'), {
      ...reflection,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving reflection:', error);
    throw error;
  }
};

export const getReflectionByNoteId = async (noteId: string) => {
  try {
    const q = query(
      collection(db, 'reflections'),
      where('noteId', '==', noteId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Reflection;
    }
    return null;
  } catch (error) {
    console.error('Error getting reflection:', error);
    return null;
  }
};