import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

// This is a singleton pattern.
// We are defining the variables here to hold the initialized instances.
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function initializeFirebase() {
    // If already initialized, return the existing instances.
    if (app && auth && db) {
        return { app, auth, db, error: null };
    }
    
    // Check if the config values are present.
    if (
        !firebaseConfig.apiKey ||
        !firebaseConfig.authDomain ||
        !firebaseConfig.projectId
    ) {
        const error = new Error("Firebase configuration is missing or incomplete. Please check your environment variables.");
        // In a server environment, you might want to throw this error.
        // On the client, returning it allows for graceful UI handling.
        return { app: null, auth: null, db: null, error };
    }
    
    try {
        // Get the existing app instance if it exists, otherwise initialize a new one.
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        
        // Set persistence for authentication on the client side.
        // This ensures auth state is maintained across page refreshes.
        if (typeof window !== 'undefined') {
            setPersistence(auth, browserLocalPersistence).catch((error) => {
                console.warn("Failed to set Firebase auth persistence:", error);
            });
        }
        
        return { app, auth, db, error: null };
    } catch (e: any) {
        console.error("Firebase initialization error:", e);
        return { app: null, auth: null, db: null, error: e };
    }
}

// Export the function that initializes and returns the services.
export { initializeFirebase };

// Client helper: find a user by username using client Firestore
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

export async function findUserByUsernameClient(username: string) {
    const { app, auth, db, error } = initializeFirebase();
    if (error || !db) {
        console.error('findUserByUsernameClient: Firebase not initialized', error);
        return null;
    }

    if (!username) return null;
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const userDoc = querySnapshot.docs[0];
        return { uid: userDoc.id, ...(userDoc.data() as any) };
    } catch (e) {
        console.error('findUserByUsernameClient error:', e);
        return null;
    }
}
