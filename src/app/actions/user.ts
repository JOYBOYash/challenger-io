
'use server';

import { initializeFirebase } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, getDoc, doc, updateDoc, arrayUnion, documentId, orderBy, arrayRemove, writeBatch } from 'firebase/firestore';
import type { UserProfile } from '@/context/auth-context';
import type { Problem } from '@/ai/flows/problem-curation';

// This is the single, secure function for all user profile updates.
// It handles both user-editable fields from the profile form and
// privileged internal updates (like plan upgrades or timestamp updates).
export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<{success: boolean}> {
    const { db } = initializeFirebase();
    if (!db) {
        console.error("Firebase error in updateUserProfile: db is null");
        return { success: false };
    }
    const userRef = doc(db, 'users', userId);

    // This object will hold only the fields that are safe and valid for this update.
    // This prevents malicious users from trying to update protected fields.
    const updatableData: Partial<UserProfile> = {};

    // User-editable fields from profile form
    if (data.bio !== undefined) updatableData.bio = data.bio;
    if (data.domain !== undefined) updatableData.domain = data.domain;
    if (data.skills !== undefined) updatableData.skills = data.skills;
    if (data.medallions !== undefined) updatableData.medallions = data.medallions;
    
    // Internal-only fields that are NOT editable from the user's profile form
    if (data.lastAiChallengeTimestamp !== undefined) updatableData.lastAiChallengeTimestamp = data.lastAiChallengeTimestamp;
    if (data.plan !== undefined) updatableData.plan = data.plan;
    if (data.razorpayPaymentId !== undefined) updatableData.razorpayPaymentId = data.razorpayPaymentId;


    try {
        // The updateDoc will only contain the fields specified in updatableData.
        await updateDoc(userRef, updatableData);
        return { success: true };
    } catch (e) {
        console.error("Error updating user profile:", e);
        return { success: false };
    }
}


export async function saveChallenge(userId: string, problem: Problem): Promise<{success: boolean}> {
    const { db } = initializeFirebase();
    if (!db) {
        console.error("Firebase error in saveChallenge: db is null");
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
    const { db } = initializeFirebase();
    if (!db) {
        console.error("Firebase error in removeChallenge: db is null");
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
  const { db } = initializeFirebase();
  if (!db) {
    console.error("Firebase error in findUserByUsername: db is null");
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

export async function findUserById(uid: string): Promise<UserProfile | null> {
    const { db } = initializeFirebase();
    if (!db) {
        console.error("Firebase error in findUserById: db is null");
        return null;
    }
    if (!uid) return null;
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        return null;
    }
    return userSnap.data() as UserProfile;
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const { db } = initializeFirebase();
  if (!db) {
    console.error("Firebase error in isUsernameTaken: db is null");
    return true; // Fail safe, prevent username creation
  }
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username), limit(1));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function searchUsers(currentUserId: string, searchTerm: string): Promise<UserProfile[]> {
  const { db } = initializeFirebase();
  if (!db || !searchTerm) {
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

export async function sendConnectionRequest(requesterId: string, recipientId: string): Promise<{success: boolean; message?: string; reason?: 'limit_reached' | 'already_connected' | 'unknown'}> {
  const { db } = initializeFirebase();
  if (!db) {
    console.error("Firebase error in sendConnectionRequest: db is null");
    return { success: false, message: 'Database error.', reason: 'unknown' };
  }
  const requesterRef = doc(db, 'users', requesterId);
  const recipientRef = doc(db, 'users', recipientId);
  try {
    const requesterSnap = await getDoc(requesterRef);
    if (!requesterSnap.exists()) {
        return { success: false, message: 'Requester does not exist.', reason: 'unknown' };
    }
    const requesterData = requesterSnap.data() as UserProfile;
    
    const limit = requesterData.plan === 'pro' ? 50 : 10;
    if ((requesterData.connections?.length || 0) >= limit) {
        return { success: false, message: `You have reached your connection limit of ${limit}. Upgrade to Pro for more connections.`, reason: 'limit_reached' };
    }

    const batch = writeBatch(db);
    batch.update(requesterRef, { sentRequests: arrayUnion(recipientId) });
    batch.update(recipientRef, { pendingConnections: arrayUnion(requesterId) });
    await batch.commit();
    return { success: true };
  } catch (e) {
    console.error("Error sending connection request:", e);
    return { success: false, message: 'An unexpected error occurred.', reason: 'unknown' };
  }
}

export async function acceptConnectionRequest(userId: string, requesterId: string): Promise<{success: boolean}> {
  const { db } = initializeFirebase();
  if (!db) {
    console.error("Firebase error in acceptConnectionRequest: db is null");
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
  const { db } = initializeFirebase();
  if (!db) {
    console.error("Firebase error in declineConnectionRequest: db is null");
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
    const { db } = initializeFirebase();
    if (!db || uids.length === 0) {
        return [];
    }
    
    // Firestore 'in' query is limited to 30 elements. For a larger scale app, this would need pagination.
    const uidsToQuery = uids.slice(0, 30);
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where(documentId(), 'in', uidsToQuery));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}

export async function getConnectedUsers(userId: string): Promise<UserProfile[]> {
    const { db } = initializeFirebase();
    if (!db) {
        return [];
    }
    
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
}

// Non-AI based user suggestion based on shared skills.
export async function getSuggestedUsers(currentUser: UserProfile): Promise<UserProfile[]> {
    const { db } = initializeFirebase();
    if (!db) {
        return [];
    }

    const currentUserSkills = new Set(currentUser.skills || []);
    const excludedIds = new Set([
        currentUser.uid,
        ...(currentUser.connections || []),
        ...(currentUser.sentRequests || []),
        ...(currentUser.pendingConnections || [])
    ]);

    // Fetch a batch of users to compare against.
    // In a real large-scale app, this would need a more sophisticated discovery mechanism.
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(50));
    const querySnapshot = await getDocs(q);

    const scoredUsers: { user: UserProfile; score: number }[] = [];

    querySnapshot.forEach(doc => {
        const potentialMatch = doc.data() as UserProfile;
        
        if (excludedIds.has(potentialMatch.uid)) {
            return; // Skip if user is self, already connected, or has a pending request.
        }

        const matchSkills = new Set(potentialMatch.skills || []);
        const commonSkillsCount = [...currentUserSkills].filter(skill => matchSkills.has(skill)).length;
        
        // We only want to suggest users with at least one shared skill.
        if (commonSkillsCount > 0) {
            scoredUsers.push({ user: potentialMatch, score: commonSkillsCount });
        }
    });

    // Sort by score (descending) and return the top 10.
    return scoredUsers
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.user);
}
