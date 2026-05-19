import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import admin from '../firebase.js';

const router = express.Router();
const prisma = new PrismaClient();

// Fetch all users (Admin only)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await prisma.userProfile.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Admin registers a new user (Customer or Admin)
router.post('/register', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, email, password, phone, companyName, companyAddress, gstin, role, adminSecretKey } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }

  if (!companyName || !gstin) {
    return res.status(400).json({ error: 'Company name and GSTIN are required.' });
  }

  // Validate admin secret key if registering an admin
  if (role === 'admin') {
    const secretKey = process.env.ADMIN_SECRET_KEY || 'bsemetals-admin-2026';
    if (!adminSecretKey || adminSecretKey !== secretKey) {
      return res.status(403).json({ error: 'Invalid Admin Secret Key. Cannot create admin account.' });
    }
  }

  const isFirebaseConfigured =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL;

  let uid = `mock-uid-${Date.now()}`;

  if (isFirebaseConfigured) {
    try {
      const userRecord = await admin.auth().createUser({ email, password, displayName: name });
      uid = userRecord.uid;
      // Try to set Firebase custom claims (best effort — DB role is the source of truth)
      try {
        await admin.auth().setCustomUserClaims(uid, { role });
      } catch (claimsErr) {
        console.warn('Warning: Could not set Firebase custom claims:', claimsErr.message);
      }
    } catch (error) {
      console.error('Error creating Firebase user:', error);
      return res.status(500).json({ error: error.message || 'Failed to create user in Firebase.' });
    }
  }

  try {
    const profile = await prisma.userProfile.create({
      data: { uid, name, email, role, phone: phone || null, companyName, companyAddress: companyAddress || null, gstin }
    });
    res.status(201).json({ message: 'User created successfully', user: profile });
  } catch (error) {
    console.error('Error creating user profile in DB:', error);
    res.status(500).json({ error: 'Failed to save user profile in database.' });
  }
});

// Manually fix a user's role (Admin only — for correcting existing accounts)
router.post('/fix-role', authenticateToken, requireRole('admin'), async (req, res) => {
  const { email, role } = req.body;
  if (!email || !['admin', 'customer'].includes(role)) {
    return res.status(400).json({ error: 'Valid email and role are required.' });
  }
  try {
    const profile = await prisma.userProfile.update({
      where: { email },
      data: { role }
    });
    // Also try to update Firebase claims
    try {
      const isFirebaseConfigured =
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL;
      if (isFirebaseConfigured) {
        const fbUser = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(fbUser.uid, { role });
      }
    } catch (fbErr) {
      console.warn('Firebase claims update failed (non-fatal):', fbErr.message);
    }
    res.json({ message: `Role updated to '${role}' for ${email}`, profile });
  } catch (error) {
    console.error('Error fixing role:', error);
    res.status(500).json({ error: 'Failed to update role. Is the email registered?' });
  }
});

// Create or Update User Profile (called on signup)
router.post('/profile', authenticateToken, async (req, res) => {
  const { name, email, role, phone, companyName, companyAddress, gstin } = req.body;
  const uid = req.user.uid;
  // Role from token claims or body, default to customer
  const resolvedRole = role || req.user.role || 'customer';

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required fields.' });
  }

  try {
    const profile = await prisma.userProfile.upsert({
      where: { uid },
      update: { name, email, role: resolvedRole, phone, companyName, companyAddress, gstin },
      create: { uid, name, email, role: resolvedRole, phone, companyName, companyAddress, gstin }
    });
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error saving user profile:', error);
    res.status(500).json({ error: 'Failed to save user profile.' });
  }
});

// Fetch Admin Contact Info (uses DB role — no Firebase dependency)
router.get('/admin-info', authenticateToken, async (req, res) => {
  try {
    const adminProfile = await prisma.userProfile.findFirst({
      where: { role: 'admin' },
      orderBy: { createdAt: 'asc' },
      select: { name: true, email: true, phone: true, companyName: true, companyAddress: true, gstin: true }
    });
    if (!adminProfile) {
      return res.status(404).json({ error: 'Admin contact info not found.' });
    }
    res.json(adminProfile);
  } catch (error) {
    console.error('Error fetching admin info:', error);
    res.status(500).json({ error: 'Failed to fetch admin contact info.' });
  }
});

// Fetch current user's profile (returns role from DB — source of truth)
router.get('/profile', authenticateToken, async (req, res) => {
  const uid = req.user.uid;
  try {
    const profile = await prisma.userProfile.findUnique({ where: { uid } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

export default router;
