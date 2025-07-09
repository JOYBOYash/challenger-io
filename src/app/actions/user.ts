'use server';

import { initializeFirebase } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, getDoc, doc } from 'firebase/firestore';
import type { UserProfile } from '@/context/auth-context';

export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  const { db, error } = initializeFirebase();
  if (error || !db) {
    console.error("Firebase error in findUserByUsername:", error?.message);
    return null;
  }

  if (!username) return null;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username), limit(1));
  
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }
  
  const userDoc = querySnapshot.docs[0];
  return userDoc.data() as UserProfile;
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const { db, error } = initializeFirebase();
  if (error || !db) {
    console.error("Firebase error in isUsernameTaken:", error?.message);
    return true; // Fail safe, prevent username creation
  }
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username), limit(1));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}
