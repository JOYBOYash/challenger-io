'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import Loading from '@/app/loading';
import type { Problem } from '@/ai/flows/problem-curation';
import { useFirebase } from '@/firebase/hooks';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

// Add the email(s) of any user you want to have automatic Pro access here.
export const PRO_USER_EMAILS = ['joyboysskofficially@gmail.com'];

export type UserProfile = {
    uid: string;
    email: string;
    username: string;
    plan?: 'free' | 'pro';
    razorpayPaymentId?: string; // Switched from paddle
    connections?: string[];
    pendingConnections?: string[];
    sentRequests?: string[];
    photoURL?: string;
    bio?: string;
    domain?: string;
    skills?: string[];
    savedChallenges?: Problem[];
    lastAiChallengeTimestamp?: number;
    medallions?: string[];
};

interface AuthContextType {
    user: UserProfile | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const { auth, db } = useFirebase();

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setFirebaseUser(authUser);
                if (db) {
                    const docRef = doc(db, 'users', authUser.uid);
                    
                    const unsubscribeFirestore = onSnapshot(docRef, 
                        (docSnap) => {
                            if (docSnap.exists()) {
                                const userData = docSnap.data() as UserProfile;
                                
                                // Override plan to 'pro' if user's email is in the special list
                                if (authUser.email && PRO_USER_EMAILS.includes(authUser.email)) {
                                    userData.plan = 'pro';
                                }
                                
                                setUser(userData);
                            } else {
                                setUser(null);
                            }
                            setLoading(false);
                        }, 
                        async (err) => {
                            const permissionError = new FirestorePermissionError({
                                path: docRef.path,
                                operation: 'get',
                            });
                            errorEmitter.emit('permission-error', permissionError);
                            setUser(null);
                            setLoading(false);
                        }
                    );
                    
                    return () => unsubscribeFirestore();
                } else {
                     setUser(null);
                     setLoading(false);
                }
            } else {
                setFirebaseUser(null);
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [auth, db]);

    const value = { user, firebaseUser, loading };

    return (
        <AuthContext.Provider value={value}>
            <FirebaseErrorListener />
            {loading ? <Loading /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
