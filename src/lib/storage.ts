import { ServiceRecord } from '../types';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreError';

const COLLECTION_NAME = 'service_records';

export const subscribeRecords = (callback: (records: ServiceRecord[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as ServiceRecord[];
    callback(records);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  });
};

export const saveRecord = async (record: Omit<ServiceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(docRef, {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};

export const getRecordById = async (id: string): Promise<ServiceRecord | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate(),
        updatedAt: snapshot.data().updatedAt?.toDate()
      } as ServiceRecord;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
    return null;
  }
};

export const deleteRecordById = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};

export const getRelatedRecords = async (make: string, model: string, excludeId: string): Promise<ServiceRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      // Firebase needs an index if we order, so we will just fetch them and sort client-side to avoid index requirement for equal filters
    );
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as ServiceRecord[];
    
    return records.filter(r => 
      r.id !== excludeId && 
      r.vehicleMake.toLowerCase() === make.toLowerCase() && 
      r.vehicleModel.toLowerCase() === model.toLowerCase()
    ).sort((a, b) => {
       if (a.createdAt && b.createdAt) {
         return b.createdAt.getTime() - a.createdAt.getTime();
       }
       return 0;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    return [];
  }
};
