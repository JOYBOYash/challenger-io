'use server';

import { initializeFirebase } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, getDoc, doc, updateDoc, arrayUnion, documentId, orderBy } from 'firebase/firestore';
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

export async function searchUsers(currentUserId: string, searchTerm: string): Promise<UserProfile[]> {
  const { db, error } = initializeFirebase();
  if (error || !db || !searchTerm) {
    return [];
  }
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    orderBy('username'),
    where('username', '>=', searchTerm),
    where('username', '<=', searchTerm + '\uf8ff'),
    limit(10)
  );
  
  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs
    .map(doc => doc.data() as UserProfile)
    .filter(user => user.uid !== currentUserId);

  return users;
}

export async function addConnection(userId: string, friendId: string): Promise<{success: boolean}> {
  const { db, error } = initializeFirebase();
  if (error || !db) {
    console.error("Firebase error in addConnection:", error?.message);
    return { success: false };
  }
  const userRef = doc(db, 'users', userId);
  const friendRef = doc(db, 'users', friendId);
  try {
    await updateDoc(userRef, { connections: arrayUnion(friendId) });
    await updateDoc(friendRef, { connections: arrayUnion(userId) });
    return { success: true };
  } catch (e) {
    console.error("Error adding connection:", e);
    return { success: false };
  }
}

export async function getConnectedUsers(userId: string): Promise<UserProfile[]> {
    const { db, error } = initializeFirebase();
    if (error || !db) {
        console.error("Firebase error in getConnectedUsers:", error?.message);
        return [];
    }
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        return [];
    }
    const userData = userSnap.data() as UserProfile;
    const connectionIds = userData.connections;

    if (!connectionIds || connectionIds.length === 0) {
        return [];
    }
    
    const usersRef = collection(db, 'users');
    // Firestore 'in' query is limited to 30 elements. For a larger scale app, this would need pagination.
    const q = query(usersRef, where(documentId(), 'in', connectionIds.slice(0, 30)));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}
