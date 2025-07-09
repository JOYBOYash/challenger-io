'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/lib/firebase';
import Loading from '@/app/loading';

export type UserProfile = {
    uid: string;
    email: string;
    username: string;
    connections?: string[];
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

    useEffect(() => {
        const { auth, db, error } = initializeFirebase();

        if (error || !auth) {
            console.error("AuthProvider Error: Failed to initialize Firebase.", error);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                if (db) {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUser(docSnap.data() as UserProfile);
                    } else {
                        // Handle case where user exists in Auth but not in Firestore
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } else {
                setFirebaseUser(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = { user, firebaseUser, loading };

    return (
        <AuthContext.Provider value={value}>
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
