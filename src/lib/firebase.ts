
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let app: FirebaseApp;
let auth: Auth;

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDkjXsZkQtQ9GSbeyMENNm-HLY-gz4Eum8", // Use environment variable or fallback
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sportsofficeapp.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sportsofficeapp",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sportsofficeapp.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1020460978896",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1020460978896:web:b05960f102f3a1e26c45b1",
};

  // Initialize Firebase
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

// Initialize Firebase Authentication and get a reference to the service
auth = getAuth(app);

export { app, auth }; // Export both app and auth
