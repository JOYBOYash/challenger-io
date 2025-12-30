'use client';
import React, { createContext, useMemo, useEffect } from 'react';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

type FirebaseContextValue = {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
};

export const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  db: null,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { app, auth, db } = useMemo(() => {
    if (typeof window === 'undefined') {
      // On the server, we don't initialize Firebase. Server actions will do this.
      return { app: null, auth: null, db: null };
    }

    let app: FirebaseApp;
    if (!getApps().length) {
      if (
        !firebaseConfig.apiKey ||
        !firebaseConfig.authDomain ||
        !firebaseConfig.projectId
      ) {
        console.error("Firebase config is missing on the client.");
        return { app: null, auth: null, db: null };
      }
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    return { app, auth, db };
  }, []);

  // Set persistence in a separate effect to ensure it runs after initialization
  useEffect(() => {
    if (auth && typeof window !== 'undefined') {
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn("Failed to set Firebase auth persistence:", error);
      });
    }
  }, [auth]);

  return (
    <FirebaseContext.Provider value={{ app, auth, db }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}
