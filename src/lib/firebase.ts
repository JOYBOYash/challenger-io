import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
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
        return { app: null, auth: null, db: null, error };
    }
    
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        return { app, auth, db, error: null };
    } catch (e: any) {
        console.error("Firebase initialization error:", e);
        return { app: null, auth: null, db: null, error: e };
    }
}

export { initializeFirebase };
