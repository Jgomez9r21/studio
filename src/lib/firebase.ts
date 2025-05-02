// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";

let app;
let auth;

const firebaseConfig: FirebaseOptions = {
    apiKey: 'AIzaSyDkjXsZkQtQ9GSbeyMENNm-HLY-gz4Eum8',
    authDomain: "sportsofficeapp.firebaseapp.com",
    projectId: "sportsofficeapp",
    storageBucket: "sportsofficeapp.appspot.com",
    messagingSenderId: '1020460978896',
    appId: '1:1020460978896:web:b05960f102f3a1e26c45b1',
};

  // Initialize Firebase
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

auth = getAuth(app);

export { app, auth };
