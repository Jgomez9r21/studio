// This file contains the initialization and configuration for the Firebase Admin SDK.

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Extend the ServiceAccount type to make privateKeyId and privateKey optional
type OptionalServiceAccount = ServiceAccount & {
 privateKeyId?: string;
 privateKey?: string;
};

import { applicationDefault } from 'firebase-admin/app';

// Construct the service account object from environment variables
const serviceAccount: OptionalServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  // Replace escaped newlines \\n with actual newlines \n in the private key
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_ADMIN_CLIENT_ID,
  authUri: process.env.FIREBASE_ADMIN_AUTH_URI,
  tokenUri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  authProviderX509CertUrl: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  clientC509CertUrl: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
  // universeDomain is optional, add if needed and present in your key
  // universeDomain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN
};

// Check if required fields are present. privateKeyId and privateKey are now optional.
const requiredFields: (keyof ServiceAccount)[] = ['projectId', 'clientEmail'];
const missingFields = requiredFields.filter(field => {
  const value = serviceAccount[field];
  // Check for null, undefined, and empty string
  return value === null || value === undefined || value === '';
});

let adminApp: admin.app.App | null = null;

if (missingFields.length > 0 || !serviceAccount.privateKey) { // Check if required fields are missing OR privateKey is missing
  console.warn(`Firebase Admin SDK not initialized. Missing environment variables: ${missingFields.join(', ')}. Check your .env file.`);
  // If required fields are missing or privateKey is missing,
  // attempt to initialize with applicationDefault credentials.
  if (!admin.apps.length) {
    try {
      adminApp = admin.initializeApp({ credential: applicationDefault() });
      console.log('Firebase Admin SDK initialized successfully with application default credentials.');
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization error with application default credentials:', error.stack);
    }
  }
} else {
  if (!admin.apps.length) {
    try {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Optionally add databaseURL if needed for Realtime Database and projectId is available
        ...(serviceAccount.projectId && { databaseURL: `https://${serviceAccount.projectId}.firebaseio.com` })
      });
      console.log('Firebase Admin SDK initialized successfully with service account.');
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization error:', error.stack);
      adminApp = null; // Ensure adminApp is null on error
    }
  } else {
    adminApp = admin.app(); // Get the default app if already initialized
    console.log('Firebase Admin SDK already initialized.');
 }
}
export { adminApp }; // Export the initialized app (which might be null, but should be initialized in one of the branches)
// You might also want to export specific services like auth or firestore:
// export const adminAuth = adminApp ? adminApp.auth() : null;
// export const adminDb = adminApp ? adminApp.firestore() : null;
