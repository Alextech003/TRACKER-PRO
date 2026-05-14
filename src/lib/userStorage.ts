import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDoc, serverTimestamp, query, orderBy, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreError';

const COLLECTION_NAME = 'users';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: 'admin' | 'tecnico' | 'tecnico_criador';
  lastAccess?: Date;
  createdAt?: Date;
}

export const subscribeUsers = (callback: (users: UserProfile[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastAccess: doc.data().lastAccess?.toDate()
    })) as UserProfile[];
    callback(users);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  });
};

export const saveUserProfile = async (user: Omit<UserProfile, 'createdAt' | 'lastAccess'>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, user.uid);
    await setDoc(docRef, {
      ...user,
      createdAt: serverTimestamp(),
      lastAccess: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};

export const updateUserLastAccess = async (uid: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    await updateDoc(docRef, {
      lastAccess: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
  }
};

export const updateUserRole = async (uid: string, role: 'admin' | 'tecnico' | 'tecnico_criador') => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    await updateDoc(docRef, {
      role
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${uid}`);
  }
};

export const deleteUserById = async (uid: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${uid}`);
  }
};
