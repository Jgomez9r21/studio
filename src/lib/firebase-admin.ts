
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Construct the service account object from environment variables
const serviceAccount: ServiceAccount = {
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

// Check if all required fields are present
const requiredFields: (keyof ServiceAccount)[] = ['projectId', 'privateKey', 'clientEmail'];
const missingFields = requiredFields.filter(field => !serviceAccount[field]);

let adminApp: admin.app.App | null = null; // Initialize as null

if (missingFields.length > 0) {
  console.warn(`Firebase Admin SDK not initialized. Missing environment variables: ${missingFields.join(', ')}. Check your .env file.`);
} else {
  if (!admin.apps.length) {
    try {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Optionally add databaseURL if needed for Realtime Database
        // databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization error:', error.stack);
      adminApp = null; // Ensure adminApp is null on error
    }
  } else {
    adminApp = admin.app(); // Get the default app if already initialized
    console.log('Firebase Admin SDK already initialized.');
  }
}

export { adminApp }; // Export the initialized app (which might be null)
// You might also want to export specific services like auth or firestore:
// export const adminAuth = adminApp ? adminApp.auth() : null;
// export const adminDb = adminApp ? adminApp.firestore() : null;
