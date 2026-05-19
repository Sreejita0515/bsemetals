import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const isFirebaseConfigured = !!process.env.FIREBASE_PROJECT_ID;

if (isFirebaseConfigured) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    } else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK. Falling back to Developer Mock Mode.', error);
  }
} else {
  console.log('Firebase credentials not found in env. Running in Developer Mock Auth Mode.');
}

/**
 * Verifies an ID token (Firebase or Mock).
 * @param {string} token 
 * @returns {Promise<{uid: string, email: string, role: 'admin'|'customer'}>}
 */
export async function verifyIdToken(token) {
  if (!token) {
    throw new Error('Token is missing');
  }

  // 1. Check if we are running in mock token mode
  if (token.startsWith('mock-token-')) {
    const role = token.replace('mock-token-', '');
    if (role === 'admin') {
      return {
        uid: 'demo-admin-uid',
        email: 'admin@bsemetals.com',
        role: 'admin',
        name: 'Administrator',
      };
    } else if (role === 'customer') {
      return {
        uid: 'demo-customer-uid',
        email: 'rajesh@alphaelec.com',
        role: 'customer',
        name: 'Rajesh Patel',
      };
    } else {
      throw new Error('Invalid mock token role');
    }
  }

  // 2. Real Firebase ID Token Verification
  if (!isFirebaseConfigured) {
    throw new Error('Real token supplied but Firebase Admin is not configured in .env');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Custom claims role extraction
    const role = decodedToken.role || (decodedToken.email?.endsWith('@bsemetals.com') ? 'admin' : 'customer');
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: role,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new Error('Unauthorized: Invalid Firebase token');
  }
}

export default admin;
