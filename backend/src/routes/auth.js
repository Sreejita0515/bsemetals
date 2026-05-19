import express from 'express';
import admin from '../firebase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Verify Admin Secret Key
router.post('/verify-secret', (req, res) => {
  const { secret } = req.body;
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'bsemetals-admin-2026';
  
  if (!secret) {
    return res.status(400).json({ error: 'Secret key is required' });
  }

  if (secret === adminSecret) {
    return res.json({ success: true });
  } else {
    return res.status(403).json({ error: 'Invalid Admin Secret Key' });
  }
});

// Assign role custom claims to a Firebase user.
// In a real environment, this allows setting the claims.
// In Mock mode, it serves as a mock resolver.
router.post('/set-role', async (req, res) => {
  const { uid, email, role } = req.body;

  if (!uid && !email) {
    return res.status(400).json({ error: 'Either uid or email is required' });
  }
  if (!role || !['admin', 'customer'].includes(role)) {
    return res.status(400).json({ error: 'Valid role (admin, customer) is required' });
  }

  // Check if Firebase Admin is configured
  const isFirebaseConfigured =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL;

  if (!isFirebaseConfigured) {
    return res.json({
      message: `[Dev Mode] Successfully simulated setting role '${role}' for ${email || uid}.`,
      mock: true
    });
  }

  try {
    let targetUid = uid;

    // If email is provided, get user by email first
    if (!targetUid && email) {
      const userRecord = await admin.auth().getUserByEmail(email);
      targetUid = userRecord.uid;
    }

    // Set custom user claims
    await admin.auth().setCustomUserClaims(targetUid, { role });

    res.json({
      message: `Successfully set custom claim role '${role}' for user UID: ${targetUid}`
    });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    res.status(500).json({ error: error.message || 'Failed to set custom claims' });
  }
});

// A route to inspect the current authenticated user's claims
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
