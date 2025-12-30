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
      return [];
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return [];
      }

      const userData = userSnap.data() as UserProfile;
      const connectionIds = userData.connections || [];

      if (connectionIds.length === 0) {
        return [];
      }

      return getUsersByIds(connectionIds);
    } catch (e: any) {
      console.error('Error getting connected users:', e);
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
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (e: any) {
      console.error('Error getting users by IDs:', e);
      return [];
    }
  };

  return {
    updateUserProfile,
    saveChallenge,
    removeChallenge,
    getConnectedUsers,
  };
}
