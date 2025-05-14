
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore"; // Import Firestore

let app: FirebaseApp;
let auth: Auth;
let db: Firestore; // Declare Firestore instance

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

// Initialize Firebase
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully with client config.");
  } catch (error) {
    console.error("Error initializing Firebase client SDK:", error);
    // Fallback or error handling if initialization fails
    // For critical Firebase features, you might want to throw the error or show a user-facing message.
  }
} else {
  app = getApp();
  console.log("Firebase client SDK already initialized.");
}

// Initialize Firebase Authentication and get a reference to the service
// Ensure 'app' is initialized before calling getAuth
// @ts-ignore
if (app) {
  auth = getAuth(app);
  db = getFirestore(app); // Initialize Firestore
} else {
  // Handle the case where app initialization failed.
  // This might involve a fallback or logging an error.
  console.error("Firebase app is not initialized. Auth and Firestore services cannot be created.");
  // @ts-ignore
  auth = null; // Explicitly set auth to null or handle appropriately
  // @ts-ignore
  db = null; // Explicitly set db to null
}


export { app, auth, db }; // Export app, auth, and db
