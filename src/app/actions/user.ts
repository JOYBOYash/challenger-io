'use server';

import { initializeFirebase } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, getDoc, doc, updateDoc, arrayUnion, documentId, orderBy, arrayRemove, writeBatch } from 'firebase/firestore';
import type { UserProfile } from '@/context/auth-context';
import type { Problem } from '@/ai/flows/problem-curation';


export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<{success: boolean}> {
    const { db, error } = initializeFirebase();
    if (error || !db) {
        console.error("Firebase error in updateUserProfile:", error?.message);
        return { success: false };
    }
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, data);
        return { success: true };
    } catch (e) {
        console.error("Error updating user profile:", e);
        return { success: false };
    }
}

export async function saveChallenge(userId: string, problem: Problem): Promise<{success: boolean}> {
    const { db, error } = initializeFirebase();
    if (error || !db) {
        console.error("Firebase error in saveChallenge:", error?.message);
        return { success: false };
    }
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, { savedChallenges: arrayUnion(problem) });
        return { success: true };
    } catch (e) {
        console.error("Error saving challenge:", e);
        return { success: false };
    }
}

export async function removeChallenge(userId: string, problem: Problem): Promise<{success: boolean}> {
    const { db, error } = initializeFirebase();
    if (error || !db) {
        console.error("Firebase error in removeChallenge:", error?.message);
        return { success: false };
    }
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, { savedChallenges: arrayRemove(problem) });
        return { success: true };
    } catch (e) {
        console.error("Error removing challenge:", e);
        return { success: false };
    }
}


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

export async function sendConnectionRequest(requesterId: string, recipientId: string): Promise<{success: boolean}> {
  const { db, error } = initializeFirebase();
  if (error || !db) {
    console.error("Firebase error in sendConnectionRequest:", error?.message);
    return { success: false };
  }
  const requesterRef = doc(db, 'users', requesterId);
  const recipientRef = doc(db, 'users', recipientId);
  try {
    const batch = writeBatch(db);
    batch.update(requesterRef, { sentRequests: arrayUnion(recipientId) });
    batch.update(recipientRef, { pendingConnections: arrayUnion(requesterId) });
    await batch.commit();
    return { success: true };
  } catch (e) {
    console.error("Error sending connection request:", e);
    return { success: false };
  }
}

export async function acceptConnectionRequest(userId: string, requesterId: string): Promise<{success: boolean}> {
  const { db, error } = initializeFirebase();
  if (error || !db) {
    console.error("Firebase error in acceptConnectionRequest:", error?.message);
    return { success: false };
  }
  const userRef = doc(db, 'users', userId);
  const requesterRef = doc(db, 'users', requesterId);
  try {
    const batch = writeBatch(db);
    // Add to connections for both
    batch.update(userRef, { connections: arrayUnion(requesterId) });
    batch.update(requesterRef, { connections: arrayUnion(userId) });
    // Remove from pending/sent lists
    batch.update(userRef, { pendingConnections: arrayRemove(requesterId) });
    batch.update(requesterRef, { sentRequests: arrayRemove(userId) });
    await batch.commit();
    return { success: true };
  } catch (e) {
    console.error("Error accepting connection request:", e);
    return { success: false };
  }
}

export async function declineConnectionRequest(userId: string, requesterId: string): Promise<{success: boolean}> {
  const { db, error } = initializeFirebase();
  if (error || !db) {
    console.error("Firebase error in declineConnectionRequest:", error?.message);
    return { success: false };
  }
  const userRef = doc(db, 'users', userId);
  const requesterRef = doc(db, 'users', requesterId);
  try {
    const batch = writeBatch(db);
    batch.update(userRef, { pendingConnections: arrayRemove(requesterId) });
    batch.update(requesterRef, { sentRequests: arrayRemove(userId) });
    await batch.commit();
    return { success: true };
  } catch (e) {
    console.error("Error declining connection request:", e);
    return { success: false };
  }
}

export async function getUsersByIds(uids: string[]): Promise<UserProfile[]> {
    const { db, error } = initializeFirebase();
    if (error || !db || uids.length === 0) {
        return [];
    }
    
    // Firestore 'in' query is limited to 30 elements. For a larger scale app, this would need pagination.
    const uidsToQuery = uids.slice(0, 30);
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where(documentId(), 'in', uidsToQuery));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}
