'use client';

import { doc, updateDoc, arrayUnion, arrayRemove, writeBatch, getDoc, query, where, getDocs, collection, limit } from 'firebase/firestore';
import { useFirebase } from '@/firebase/hooks';
import type { UserProfile } from '@/context/auth-context';
import type { Problem } from '@/ai/flows/problem-curation';

/**
 * Client-side user profile operations
 * These run directly on the client with authenticated Firestore access
 * No server actions needed - the user's auth token is automatically attached
 */

export function useUserActions() {
  const { db } = useFirebase();

  const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }

    const userRef = doc(db, 'users', userId);
    const updatableData: Partial<UserProfile> = {};

    // User-editable fields from profile form
    if (data.bio !== undefined) updatableData.bio = data.bio;
    if (data.domain !== undefined) updatableData.domain = data.domain;
    if (data.skills !== undefined) updatableData.skills = data.skills;
    if (data.medallions !== undefined) updatableData.medallions = data.medallions;

    // Internal-only fields that CAN be updated from client (with new simplified rules)
    if (data.lastAiChallengeTimestamp !== undefined) updatableData.lastAiChallengeTimestamp = data.lastAiChallengeTimestamp;
    if (data.plan !== undefined) updatableData.plan = data.plan;
    if (data.razorpayPaymentId !== undefined) updatableData.razorpayPaymentId = data.razorpayPaymentId;

    try {
      await updateDoc(userRef, updatableData);
      return { success: true };
    } catch (e: any) {
      console.error('Error updating user profile:', e);
      return { success: false, error: e.message };
    }
  };

  const saveChallenge = async (userId: string, problem: Problem): Promise<{ success: boolean; error?: string }> => {
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }

    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { savedChallenges: arrayUnion(problem) });
      return { success: true };
    } catch (e: any) {
      console.error('Error saving challenge:', e);
      return { success: false, error: e.message };
    }
  };

  const removeChallenge = async (userId: string, problem: Problem): Promise<{ success: boolean; error?: string }> => {
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }

    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { savedChallenges: arrayRemove(problem) });
      return { success: true };
    } catch (e: any) {
      console.error('Error removing challenge:', e);
      return { success: false, error: e.message };
    }
  };

  const getConnectedUsers = async (userId: string): Promise<UserProfile[]> => {
    if (!db) {
      console.log('getConnectedUsers: db not initialized');
      return [];
    }

    try {
      console.log('getConnectedUsers: fetching for user', userId);
      const userRef = doc(db, 'users', userId);
      
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log('getConnectedUsers: user document does not exist');
        return [];
      }

      const userData = userSnap.data() as UserProfile;
      const connectionIds = userData.connections || [];

      if (connectionIds.length === 0) {
        console.log('getConnectedUsers: user has no connections');
        return [];
      }

      console.log('getConnectedUsers: found', connectionIds.length, 'connections');
      return getUsersByIds(connectionIds);
    } catch (e: any) {
      console.error('Error getting connected users:', e.message);
      return [];
    }
  };

  const getUsersByIds = async (uids: string[]): Promise<UserProfile[]> => {
    if (!db || uids.length === 0) {
      return [];
    }

    try {
      // Firestore 'in' query is limited to 30 elements
      const uidsToQuery = uids.slice(0, 30);

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', uidsToQuery.map(uid => uid)));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ uid: doc.id, ...(doc.data() as UserProfile) } as UserProfile));
    } catch (e: any) {
      console.error('Error getting users by IDs:', e.message);
      return [];
    }
  };

  const findUserByUsername = async (username: string): Promise<UserProfile | null> => {
    if (!db || !username) return null;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const docSnap = querySnapshot.docs[0];
      return { uid: docSnap.id, ...(docSnap.data() as UserProfile) } as UserProfile;
    } catch (e: any) {
      console.error('findUserByUsername error:', e?.message || e);
      return null;
    }
  };

  const getAllUsers = async (): Promise<UserProfile[]> => {
    if (!db) {
      console.log('getAllUsers: ERROR - db is null/undefined. Firebase not initialized.');
      return [];
    }

    console.log('getAllUsers: Firebase db instance exists, attempting query...');

    try {
      const usersRef = collection(db, 'users');
      console.log('getAllUsers: created collection reference');
      
      const q = query(usersRef, limit(100));
      console.log('getAllUsers: created query');
      
      const startTime = Date.now();
      console.log('getAllUsers: starting getDocs query...');
      
      // No timeout - just let Firestore respond naturally
      const querySnapshot = await getDocs(q);
      
      const elapsed = Date.now() - startTime;
      console.log(`getAllUsers: SUCCESS - Got ${querySnapshot.docs.length} documents in ${elapsed}ms`);
      
      const result = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          ...data
        } as UserProfile;
      });
      
      return result;
    } catch (e: any) {
      console.error('getAllUsers error details:', {
        code: e.code,
        message: e.message,
        name: e.name,
      });
      
      // If it's a permission error, log that specifically
      if (e.code === 'permission-denied') {
        console.error('getAllUsers: PERMISSION DENIED - Check your Firestore security rules');
      }
      
      // Return empty array - don't retry endlessly
      return [];
    }
  };

  const searchUsers = async (currentUserId: string, searchTerm: string): Promise<UserProfile[]> => {
    if (!db || !searchTerm) return [];
    try {
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
        .map(doc => ({ uid: doc.id, ...(doc.data() as UserProfile) } as UserProfile))
        .filter(u => u.uid !== currentUserId);
      return users;
    } catch (e: any) {
      console.error('searchUsers error:', e?.message || e);
      return [];
    }
  };

  const getSuggestedUsers = async (currentUser: UserProfile): Promise<UserProfile[]> => {
    if (!db) return [];

    try {
      const currentUserSkills = new Set(currentUser.skills || []);
      const excludedIds = new Set([
        currentUser.uid,
        ...(currentUser.connections || []),
        ...(currentUser.sentRequests || []),
        ...(currentUser.pendingConnections || [])
      ]);

      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(50));
      const querySnapshot = await getDocs(q);

      const scoredUsers: { user: UserProfile; score: number }[] = [];

      querySnapshot.forEach(docSnap => {
        const potentialMatch = { uid: docSnap.id, ...(docSnap.data() as UserProfile) } as UserProfile;
        if (excludedIds.has(potentialMatch.uid)) return;
        const matchSkills = new Set(potentialMatch.skills || []);
        const commonSkillsCount = [...currentUserSkills].filter(skill => matchSkills.has(skill)).length;
        if (commonSkillsCount > 0) scoredUsers.push({ user: potentialMatch, score: commonSkillsCount });
      });

      return scoredUsers
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.user);
    } catch (e: any) {
      console.error('getSuggestedUsers error:', e?.message || e);
      return [];
    }
  };

  const isUsernameTaken = async (username: string): Promise<boolean> => {
    if (!db || !username) return true;
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username), limit(1));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (e: any) {
      console.error('isUsernameTaken error:', e?.message || e);
      return true;
    }
  };

  const sendConnectionRequest = async (fromUserId: string, toUserId: string): Promise<{ success: boolean; message?: string; reason?: 'limit_reached' | 'already_connected' | 'unknown' }> => {
    if (!db) {
      console.error('sendConnectionRequest: db not initialized');
      return { success: false, message: 'Firestore not initialized', reason: 'unknown' };
    }

    try {
      console.log('sendConnectionRequest: sending request from', fromUserId, 'to', toUserId);

      const fromUserRef = doc(db, 'users', fromUserId);
      const fromSnap = await getDoc(fromUserRef);
      if (!fromSnap.exists()) {
        console.error('sendConnectionRequest: requester does not exist');
        return { success: false, message: 'Requester does not exist', reason: 'unknown' };
      }

      const requesterData = fromSnap.data() as UserProfile;
      const limitCount = requesterData.plan === 'pro' ? 50 : 10;
      if ((requesterData.connections?.length || 0) >= limitCount) {
        console.warn('sendConnectionRequest: Connection limit reached');
        return { success: false, message: `You have reached your connection limit of ${limitCount}. Upgrade to Pro for more connections.`, reason: 'limit_reached' };
      }

      // Prevent duplicate connection attempts
      if (requesterData.connections?.includes(toUserId)) {
        return { success: false, message: 'Already connected', reason: 'already_connected' };
      }

      console.log('sendConnectionRequest: executing batch update...');
      const batch = writeBatch(db);
      batch.update(fromUserRef, { sentRequests: arrayUnion(toUserId) });
      const toUserRef = doc(db, 'users', toUserId);
      batch.update(toUserRef, { pendingConnections: arrayUnion(fromUserId) });
      await batch.commit();
      console.log('sendConnectionRequest: success');
      return { success: true };
    } catch (e: any) {
      console.error('sendConnectionRequest error:', {
        code: e.code,
        message: e.message,
        name: e.name
      });
      return { success: false, message: e.message || 'Unknown error', reason: 'unknown' };
    }
  };

  const acceptConnectionRequest = async (userId: string, fromUserId: string): Promise<{ success: boolean; error?: string }> => {
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }

    try {
      const batch = writeBatch(db);
      
      // Add to current user's connections and remove from pendingConnections
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, { 
        connections: arrayUnion(fromUserId),
        pendingConnections: arrayRemove(fromUserId)
      });
      
      // Add to sender's connections and remove from sentRequests
      const fromUserRef = doc(db, 'users', fromUserId);
      batch.update(fromUserRef, { 
        connections: arrayUnion(userId),
        sentRequests: arrayRemove(userId)
      });
      
      await batch.commit();
      return { success: true };
    } catch (e: any) {
      console.error('Error accepting connection request:', e);
      return { success: false, error: e.message };
    }
  };

  const declineConnectionRequest = async (userId: string, requesterId: string): Promise<{ success: boolean; error?: string }> => {
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }

    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', userId);
      const requesterRef = doc(db, 'users', requesterId);

      batch.update(userRef, { pendingConnections: arrayRemove(requesterId) });
      batch.update(requesterRef, { sentRequests: arrayRemove(userId) });

      await batch.commit();
      return { success: true };
    } catch (e: any) {
      console.error('Error declining connection request:', e);
      return { success: false, error: e.message };
    }
  };

  return {
    updateUserProfile,
    saveChallenge,
    removeChallenge,
    getConnectedUsers,
    getUsersByIds,
    getAllUsers,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    searchUsers,
    getSuggestedUsers,
    isUsernameTaken,
  };
}
