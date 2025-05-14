
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore"; // Import Firestore

let app: FirebaseApp | undefined = undefined; // Initialize as undefined
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;

// Use environment variables for Firebase config, with fallbacks for local development if needed.
// It's highly recommended to use environment variables for all Firebase config values.
const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDkjXsZkQtQ9GSbeyMENNm-HLY-gz4Eum8",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sportsofficeapp.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sportsofficeapp", // Ensure this is correctly set
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sportsofficeapp.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1020460978896",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1020460978896:web:b05960f102f3a1e26c45b1",
};

if (!firebaseConfig.projectId) {
    console.error(
        "Firebase projectId is missing. Please check your environment variables (NEXT_PUBLIC_FIREBASE_PROJECT_ID) or firebaseConfig in src/lib/firebase.ts."
    );
} else {
    if (!getApps().length) {
        try {
            app = initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully with client config. Project ID:", app.options.projectId);
        } catch (error: any) {
            console.error("Error initializing Firebase client SDK:", error.message, error.stack);
            // app remains undefined
        }
    } else {
        try {
            app = getApp();
            console.log("Firebase client SDK already initialized. Project ID:", app.options.projectId);
        } catch (error: any) {
             console.error("Error getting Firebase app instance:", error.message, error.stack);
             // app remains undefined
        }
    }
}

// Initialize Firebase Authentication and Firestore if 'app' is successfully initialized
if (app) {
    try {
        auth = getAuth(app);
        console.log("Firebase Auth service initialized.");
    } catch (error: any) {
        console.error("Error initializing Firebase Auth:", error.message, error.stack);
        auth = undefined;
    }

    try {
        db = getFirestore(app);
        console.log("Firestore service initialized.");
    } catch (error: any) {
        console.error("Error initializing Firestore service:", error.message, error.stack);
        // Specifically check for the "Service firestore is not available" error
        if (error.code === 'unavailable' || (error.message && error.message.toLowerCase().includes("service firestore is not available"))) {
            console.warn(
                `Firestore might not be enabled for project '${firebaseConfig.projectId}'. Please go to the Firebase console and ensure Firestore is enabled for this project.`
            );
        }
        db = undefined;
    }
} else {
    console.error("Firebase app is not initialized. Auth and Firestore services cannot be created.");
}


export { app, auth, db }; // Export app, auth, and db (they might be undefined)

